/**
 * Route error boundaries receive whatever was thrown. Wrap non-`Error` values so
 * error components and loggers can rely on `name` and `message`.
 */
export function toError( error: unknown ): Error {
	return error instanceof Error ? error : new Error( String( error ) );
}
