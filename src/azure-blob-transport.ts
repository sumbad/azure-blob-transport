import * as async from 'async';
import { BlobService, Constants, StorageError } from 'azure-storage';
import TransportStream, { TransportStreamOptions } from 'winston-transport';

export type BlobNameResolver = () => string;

export interface AzureBlobOptions extends TransportStreamOptions {
  /** Blob service where logs will be stored */
  blobs: BlobService;

  /** Container where logs will be stored */
  containerName: string;

  /** Blob name, or a function returning a blob name (e.g. for timestamp-segmented blobs) */
  blobName: string | BlobNameResolver;

  /** Set to true to apply log callbacks immediately. Any Blob errors will be available as 'error' events on the Transport. */
  silent?: boolean;
}

export class AzureBlobTransport extends TransportStream {
  name = 'azureBlob';

  private cargo = async.cargo((tasks, cb) => this.writeToBlob(tasks, cb));

  private get blobs() {
    return this.options.blobs;
  }

  constructor(private options: AzureBlobOptions) {
    super(options);
  }

  log(info: any, callback: () => void) {
    if (this.options.silent) {
      this.cargo.push(info, (err: Error) => (err ? this.emit('error', err) : null));
      callback();
    } else {
      this.cargo.push(info, callback);
    }
  }

  /**
   * Emits a custom close event for the purposes of testing
   * @returns {undefined}
   */
  close() {
    setImmediate(() => this.emit('closed:custom'));
  }

  private async writeToBlob(tasks: any[], callback: (err: Error | null | undefined) => void) {
    const name = this.getBlobName();
    const text = tasks.map(x => JSON.stringify(x)).join('\n') + '\n';
    const data = Buffer.from(text);
    let bytesWritten = 0;
    async.doUntil<(err: Error | null | undefined, truth: boolean) => any>(
      next => {
        // write the available log entries in chunks no larger than MAX_BLOCK_SIZE
        const chunk = data.slice(bytesWritten, Constants.BlobConstants.MAX_BLOCK_SIZE);
        bytesWritten += chunk.length;

        // optimistically write the blob (maybe container and blob do not exist yet...)
        this.blobs.appendFromText(this.options.containerName, name, chunk as any, (err: StorageError) => {
          // container and blob exist
          if (!err) {
            return next();
          }

          // some error we can't handle
          if (err.code !== 'NotFound') {
            return next(err);
          }

          // make sure container exists
          this.blobs.createContainerIfNotExists(this.options.containerName, err => {
            // some error we can't handle
            if (err) {
              return next(err);
            }

            // create the append blob
            this.blobs.createAppendBlobFromText(this.options.containerName, name, chunk, next as any);
          });
        });
      },
      check => check(null, bytesWritten === data.length),
      callback
    );
  }

  private getBlobName() {
    return typeof this.options.blobName === 'function' ? this.options.blobName() : this.options.blobName;
  }
}
