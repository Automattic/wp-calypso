/** @format */

/**
 * External dependencies
 */

import debugModule from 'debug';

const debug = debugModule( 'calypso:support-user' );

export const length = memoryStore => {
	return () => {
		debug( 'Bypassing localStorage', 'length property' );
		return Object.keys( memoryStore ).length;
	};
};

export const key = memoryStore => {
	return index => {
		debug( 'Bypassing localStorage', 'key' );
		if ( index >= Object.keys( memoryStore ).length ) {
			return null;
		}

		return Object.keys( memoryStore )[ index ];
	};
};

export const setItem = ( memoryStore, allowedKeys, original ) => {
	return ( _key, value ) => {
		if ( original && allowedKeys.indexOf( _key ) > -1 ) {
			original( _key, value );
			return;
		}

		debug( 'Bypassing localStorage', 'setItem', _key );
		memoryStore[ _key ] = value;
	};
};

export const getItem = ( memoryStore, allowedKeys, original ) => {
	return _key => {
		if ( original && allowedKeys.indexOf( _key ) > -1 ) {
			return original( _key );
		}

		debug( 'Bypassing localStorage', 'getItem', _key );
		return memoryStore[ _key ] || null;
	};
};

export const removeItem = ( memoryStore, allowedKeys, original ) => {
	return _key => {
		if ( original && allowedKeys.indexOf( _key ) > -1 ) {
			original( _key );
			return;
		}

		debug( 'Bypassing localStorage', 'removeItem', _key );
		delete memoryStore[ _key ];
	};
};

export const clear = memoryStore => {
	return () => {
		debug( 'Bypassing localStorage', 'clear' );

		for ( const _key in memoryStore ) {
			delete memoryStore[ _key ];
		}
	};
};

/**
 * Overrides localStorage, using an in-memory store instead of the real localStorage.
 *
 * This function replaces localStorage with an in-memory store and is useful in the following cases:
 * 1. Avoiding conflicts caused by shared localStorage across multiple support user sessions.
 * 2. Providing a working localStorage implementation for older Safari versions that throw errors in Private mode.
 *
 * @param {object}   [args]            An arguments object
 * @param {object}   [args.root]       Allow alternate "window" object to support tests in non-browser environments
 * @param {string[]} [arg.allowedKeys] An array of localStorage keys that are proxied to the real localStorage
 */
export default function( {
	root = typeof window === 'undefined' ? undefined : window,
	allowedKeys = [],
} = {} ) {
	debug( 'Bypassing localStorage' );

	let _setItem;
	let _getItem;
	let _removeItem;

	if ( root && root.localStorage && root.Storage && root.Storage.prototype ) {
		_setItem = root.Storage.prototype.setItem.bind( root.localStorage );
		_getItem = root.Storage.prototype.getItem.bind( root.localStorage );
		_removeItem = root.Storage.prototype.removeItem.bind( root.localStorage );
	}

	const memoryStore = {};
	const getMemoryStoreLength = length( memoryStore );
	const localStorageOverride = {
		setItem: setItem( memoryStore, allowedKeys, _setItem ),
		getItem: getItem( memoryStore, allowedKeys, _getItem ),
		removeItem: removeItem( memoryStore, allowedKeys, _removeItem ),
		key: key( memoryStore ),
		clear: clear( memoryStore ),
		get length() {
			return getMemoryStoreLength();
		},
	};

	// Redefine `window.localStorage` instead of assigning to localStorage methods
	// like `getItem` and `setItem` because it is not effective in Firefox.
	// https://github.com/whatwg/html/issues/183#issuecomment-142944605
	Object.defineProperty( root, 'localStorage', {
		value: localStorageOverride,
		enumerable: true,
		configurable: true,
	} );
}
