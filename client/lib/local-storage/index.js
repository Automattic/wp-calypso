/**
 * External dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:local-storage' );

let _data = {},
	storage = {
		setItem: function( id, val ) {
			_data[ id ] = String( val );
			return _data[ id ];
		},
		getItem: function( id ) {
			return _data.hasOwnProperty( id ) ? _data[ id ] : null;
		},
		removeItem: function( id ) {
			return delete _data[ id ];
		},
		clear: function() {
			_data = {};
			return _data;
		}
	},
	getLength = function() {
		return Object.keys( _data ).length;
	};

/**
 * Overwrite window.localStorage if necessary
 * @param  {object} root Object to instantiate `windows` object to test in node.js
 */
export default function( root ) {
	root = root || window;

	if ( ! root.localStorage ) {
		debug( 'localStorage is missing, setting to polyfill' );
		root.localStorage = {};
	}

	// test in case we are in safari private mode which fails on any storage
	try {
		root.localStorage.setItem( 'localStorageTest', '' );
		root.localStorage.removeItem( 'localStorageTest' );
		debug( 'localStorage tested and working correctly' );
	} catch ( error ) {
		debug( 'localStorage not working correctly, setting to polyfill' );
		// we cannot overwrite window.localStorage directly, but we can overwrite its methods
		root.localStorage.setItem = storage.setItem;
		root.localStorage.getItem = storage.getItem;
		root.localStorage.removeItem = storage.removeItem;
		root.localStorage.clear = storage.clear;
		root.localStorage.__defineGetter__( 'length', getLength );
	}
}
