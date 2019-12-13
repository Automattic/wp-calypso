/**
 * External dependencies
 */
import '@babel/polyfill';
import svg4everybody from 'svg4everybody';
import '@webcomponents/url';
import URLSearchParamsPolyfill from '@ungap/url-search-params';
import 'isomorphic-fetch';
import 'globalthis/auto';

/**
 * Internal dependencies
 */
import localStoragePolyfill from 'lib/local-storage-polyfill';

localStoragePolyfill();

const isBrowser = typeof window !== 'undefined';
if ( isBrowser ) {
	// Polyfill SVG external content support. Noop in the evergreen build.
	svg4everybody();
	// Polyfill URLSearchParams.
	window.URLSearchParams = window.URLSearchParams || URLSearchParamsPolyfill;
}
