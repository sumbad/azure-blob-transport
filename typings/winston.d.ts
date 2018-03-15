declare module 'winston'{
  import { Writable } from "stream";
  
  declare function winston() {}

  declare namespace winston {
    
    declare function createLogger(options: LoggerOptions): Logger;
    
    declare namespace transports {
      interface FileOptions {
        filename: string;
        level?: string;
      }
      declare class File extends winston.Transport {
        constructor(options: FileOptions);
      }
      declare class Console extends winston.Transport {
      }
    }

    declare namespace format {
      declare function json(): winston.Format;
    }

    interface Loggable {
      log: (level: string, msg: any, meta?: any, callback?: (err: Error) => void) => this;
    }

    type LogFunction = (level: string, msg: any, meta?: any, callback?: (err: Error) => void) => this;
    type LogLevelFunction = (msg: any, meta?: any, callback?: (err: Error) => void) => this;


    interface Logger extends Writable, Loggable {
      error: LogLevelFunction;
      warn: LogLevelFunction;
      info: LogLevelFunction;
      verbose: LogLevelFunction;
      debug: LogLevelFunction;
      silly: LogLevelFunction;
      log: LogFunction;

      clear: () => this;
      add: (transport: Transport) => this;
      remove: (transport: Transport) => this;
      configure: (options: LoggerOptions) => this;
    }
    interface Transport extends Writable, Loggable {
      name: string;
      initialize: () => void;
    }

    interface Format {
    }

    interface Config {
    }

    interface LoggerOptions {
      level?: string;
      format?: Format,
      transports: any[],
      exitOnError?: boolean;
    }

    interface LogInfo {
      level: string;
      message: any;
    }
  }

  export = winston;
}