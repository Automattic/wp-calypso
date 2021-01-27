/* eslint-disable no-console, @typescript-eslint/no-empty-function */

/*
 * Wraps console.warn to only emit in development and test environments.
 *
 * Many utility libraries in Calypso utilize this to warn about misuse of functions,
 * For example: stats warns when any tracks events aren't properly formatted (@see lib/analytics)
 */

let warn: typeof console.warn;
if ( process.env.NODE_ENV === 'production' || 'function' !== typeof console.warn ) {
	warn = (): void => {};
} else {
	warn = ( ...args: Parameters< typeof console.warn > ): void => console.warn( ...args );
}

export default warn;
