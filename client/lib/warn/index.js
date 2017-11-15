/** @format */
/* eslint-disable no-console */

/*
 * Wraps console.warn to only emit in development and test environments.
 *
 * Many utility libraries in Calypso utilize this to warn about misuse of functions,
 * For example: stats warns when any tracks events aren't properly formatted (@see lib/analytics)
 */

let warn;
if ( process.env.NODE_ENV === 'production' || 'function' !== typeof console.warn ) {
	warn = () => {};
} else {
	warn = ( ...args ) => console.warn( ...args );
}

export default warn;
