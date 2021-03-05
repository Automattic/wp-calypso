// Polyfills required for the "fallback" build of Calypso.
// Note that these polyfills will not necessarily be included in the build,
// since Calypso makes use of @babel/preset-env and browserslist configs to
// avoid including polyfills for features that are supported acroll all target
// browsers.

/**
 * External dependencies
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import svg4everybody from 'svg4everybody';
import 'isomorphic-fetch';

// polyfill for CustomEvent otherwise Apple login breaks on IE 11
// see: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
( function () {
	if ( typeof window === 'undefined' || typeof window.CustomEvent === 'function' ) return false;
	function CustomEvent( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: null };
		const evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}

	window.CustomEvent = CustomEvent;
} )();

svg4everybody();
