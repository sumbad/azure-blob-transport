declare module 'winston-transport' {
  import * as stream from 'stream';
  import * as logform from 'logform';

  declare class TransportStream extends stream.Writable, StandaloneTransportStreamOptions {
    constructor(options: TransportStreamOptions | StandaloneTransportStreamOptions);

    name: string;
    parent: stream.Stream;
    levels: { [key: string]: number };
  }

  declare namespace TransportStream {
    type LogFunction = (message: any, callback: (err?: Error) => void) => void;
    type LogvFunction = (message: any[], callback: (err?: Error) => void) => void;

    // interface TransportStream extends stream.Writable, StandaloneTransportStreamOptions {
    //   name: string;
    //   parent: stream.Stream;
    //   levels: { [key: string]: number };
    // }

    interface TransportStreamOptions {
      level?: string;
      handleExceptions?: boolean;
      close?: () => void;
    }
    
    interface StandaloneTransportStreamOptions extends TransportStreamOptions {
      format?: logform.Format;
      log?: LogFunction;
      logv?: LogvFunction;
    }

    export { TransportStream, LogFunction, LogvFunction, TransportStream, TransportStreamOptions, StandaloneTransportStreamOptions };
  }

  export = TransportStream;
}