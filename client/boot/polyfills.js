/** @format */
/**
 * External dependencies
 */
import '@babel/polyfill';
import svg4everybody from 'svg4everybody';
import 'isomorphic-fetch';

/**
 * Internal dependencies
 */

import localStoragePolyfill from 'lib/local-storage-polyfill';

localStoragePolyfill();

const isBrowser = typeof window !== 'undefined';
if ( isBrowser ) {
	// Polyfill SVG external content support. Noop in the evergreen build.
	svg4everybody();
}
