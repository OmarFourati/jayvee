import * as E from 'fp-ts/lib/Either';
import { AstNode, DiagnosticInfo } from 'langium';

interface ExecutionErrorDetails<N extends AstNode = AstNode> {
  message: string;
  diagnostic?: DiagnosticInfo<N>;
}

/**
 * Convenience interfaces and methods wrapping @see Either of fp-ts library.
 * Left is the @see ExecutionErrorDetails
 * Right is a generic T
 */

export type Result<T> = E.Either<ExecutionErrorDetails, T>;
export type Err = E.Left<ExecutionErrorDetails>;
export type Ok<T> = E.Right<T>;

/**
 * Creates an @Ok object from a data object typed T.
 * @param data the data object
 * @returns the created @Ok object
 */
export function ok<T>(data: T): Result<T> {
  return E.right(data);
}
/**
 * Creates an @Err object from a @ExecutionErrorDetails object.
 * @param details the @ExecutionErrorDetails object
 * @returns the created @Err object
 */
export function err<T>(details: ExecutionErrorDetails): Result<T> {
  return E.left(details);
}

/**
 * Type guard for @see Ok
 */
export function isOk<T>(result: Result<T>): result is Ok<T> {
  return E.isRight(result);
}
/**
 * Type guard for @see Err
 */
export function isErr<T>(result: Result<T>): result is Err {
  return E.isLeft(result);
}

/**
 * Convenience method to get wrapped data of an @see Ok object.
 */
export function okData<T>(ok: Ok<T>): T {
  return ok.right;
}
