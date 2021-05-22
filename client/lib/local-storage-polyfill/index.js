/**
 * External dependencies
 */

import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import localStorageBypass from '../local-storage-bypass';

const debug = debugFactory( 'calypso:local-storage' );

/**
 * Overwrite window.localStorage if necessary
 *
 * @param  {object} root Object to instantiate `windows` object to test in node.js
 */
export default function ( root ) {
	root = root || window;

	if ( ! root.localStorage ) {
		debug( 'localStorage is missing, setting to polyfill' );
		localStorageBypass( { root } );
	}

	// test in case we are in safari private mode which fails on any storage
	try {
		root.localStorage.setItem( 'localStorageTest', '' );
		root.localStorage.removeItem( 'localStorageTest' );
		debug( 'localStorage tested and working correctly' );
	} catch ( error ) {
		debug( 'localStorage not working correctly, setting to polyfill' );
		localStorageBypass( { root } );
	}
}
