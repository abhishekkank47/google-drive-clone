import { StatusCodes } from 'http-status-codes';

export interface IErrorResponse {
  message: string;
  statusCodes: number;
  status: string;
  comingFrom: string; //helpful for where is error coming from
  serializeError(): IError;
}

export interface IError {
  message: string;
  statusCodes: number;
  status: string;
  comingFrom: string;
}

//-------------------------------------------------Error Custom Class

export abstract class CustomError extends Error {
  abstract statusCodes: number;
  abstract status: string;
  comingFrom: string;
  constructor(message: string, comingFrom: string) {
    super(message);
    this.comingFrom = comingFrom;
  }

  serializeError(): IError {
    return {
      message: this.message,
      statusCodes: this.statusCodes,
      status: this.status,
      comingFrom: this.comingFrom,
    };
  }
}
//-------------------------------------------------Error Custom Class



//-------------------------------------------------Error Class
export class BadRequestError extends CustomError {
  statusCodes= StatusCodes.BAD_REQUEST;
  status = 'error';

  constructor(message:string, comingFrom:string){
    super(message, comingFrom);
  }
}

export class NotFoundError extends CustomError {
  statusCodes= StatusCodes.NOT_FOUND;
  status = 'error';

  constructor(message:string, comingFrom:string){
    super(message, comingFrom);
  }
}

export class NotAuthourisedError extends CustomError {
  statusCodes= StatusCodes.UNAUTHORIZED;
  status = 'error';

  constructor(message:string, comingFrom:string){
    super(message, comingFrom);
  }
}


export class FileTooLargeError extends CustomError {
  statusCodes= StatusCodes.REQUEST_TOO_LONG;
  status = 'error';

  constructor(message:string, comingFrom:string){
    super(message, comingFrom);
  }
}

export class ServerError extends CustomError {
  statusCodes= StatusCodes.SERVICE_UNAVAILABLE;
  status = 'error';

  constructor(message:string, comingFrom:string){
    super(message, comingFrom);
  }
}


export interface ErrorExceptionError extends Error {
  errorNo?: number;
  code?:string;
  path?:string;
  syscall?: string;
  stack?:string
}
//-------------------------------------------------Error Class



