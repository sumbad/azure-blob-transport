# azure-blob-transport

### This is a fork of [winston-azure-storage-transport](https://github.com/ctstone/winston-azure-storage-transport).

Azure Storage transports for `winston >= 3`.

## Install
```
npm install winston azure-blob-transport
```

## Usage
```JavaScript
import { transports, createLogger, format } from 'winston';
import { BlobService } from 'azure-storage';
import { AzureBlobTransport } from 'azure-blob-transport';

const azureBlobTransport = new AzureBlobTransport({
  blobs: new BlobService(process.env['AzureWebJobsStorage'] || ''),
  containerName: 'mylogs',
  blobName: 'myappendblob'
});

const logger = createLogger({
  exitOnError: false,
  level: 'info',
  format: format.json(),
  transports: [new transports.Console({}), azureBlobTransport]
});

export { logger };
```

You can write logs 'silently' so that calls to the logger do not block the callback chain. In this case, listen for 'error' events on your AzureBlobTransport to handle IO errors.
```JavaScript
const blobTransport = new AzureBlobTransport({
  blobs: new BlobService(),
  containerName: 'mylogs',
  blobName: 'myappendblob.log',
  silent: true,
}).on('error', console.error);
```

You can customize the blob name using a callback function. The blob will be created if it does not exist.
```JavaScript
const blobTransport = new AzureBlobTransport({
  blobs: new BlobService(),
  containerName: 'mylogs',
  blobName: () => {
    const d = new Date();
    return [
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      'myappendblob.log',
    ].join('/');
  },
});
```