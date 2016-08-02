/**
 * Internal dependencies
 */
import localStoragePolyfill from 'lib/local-storage';

if ( 'undefined' !== typeof window ) {
	localStoragePolyfill( window );
}
