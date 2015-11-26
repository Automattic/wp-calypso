/**
 * Internal Dependencies
 */
import config from 'config';

let warn;
if ( config( 'env' ) !== 'production' && 'function' === typeof console.warn ) {
	warn = console.warn.bind( console );
} else {
	warn = () => {};
}

export default warn;
