/* eslint-disable no-console */

/**
 * Internal Dependencies
 */
import config from 'config';

let warn;
if ( config( 'env' ) !== 'production' && 'function' === typeof console.warn ) {
	warn = ( ...args ) => console.warn( ...args );
} else {
	warn = () => {};
}

export default warn;
