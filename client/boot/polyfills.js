/**
 * External dependencies
 */
import 'core-js/stable';
import 'core-js/features/global-this';
import 'regenerator-runtime/runtime';
import svg4everybody from 'svg4everybody';
import 'isomorphic-fetch';

/**
 * Internal dependencies
 */
import localStoragePolyfill from 'lib/local-storage-polyfill';

const isBrowser = typeof window !== 'undefined';

// NOTE: This file includes polyfills for both client and server.
// If a polyfill does not work correctly on the server, make sure you only run
// it in the client, by adding its init to the if block below.
if ( isBrowser ) {
	// Polyfill SVG external content support. Noop in the evergreen build.
	svg4everybody();
	localStoragePolyfill();
}
