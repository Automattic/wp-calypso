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
		if ( allowedKeys.indexOf( _key ) > -1 ) {
			original( _key, value );
			return;
		}

		debug( 'Bypassing localStorage', 'setItem', _key );
		memoryStore[ _key ] = value;
	};
};

export const getItem = ( memoryStore, allowedKeys, original ) => {
	return _key => {
		if ( allowedKeys.indexOf( _key ) > -1 ) {
			return original( _key );
		}

		debug( 'Bypassing localStorage', 'getItem', _key );
		return memoryStore[ _key ] || null;
	};
};

export const removeItem = ( memoryStore, allowedKeys, original ) => {
	return _key => {
		if ( allowedKeys.indexOf( _key ) > -1 ) {
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
 * This avoids conflicts caused by shared localStorage across multiple support user sessions.
 * @param  {string[]} allowedKeys An array of localStorage keys that are proxied to the real localStorage
 */
export default function( allowedKeys ) {
	if ( window && window.localStorage && window.Storage && window.Storage.prototype ) {
		debug( 'Bypassing localStorage' );
		const memoryStore = {};
		const _setItem = window.Storage.prototype.setItem.bind( window.localStorage );
		const _getItem = window.Storage.prototype.getItem.bind( window.localStorage );
		const _removeItem = window.Storage.prototype.removeItem.bind( window.localStorage );

		const localStorageOverride = {
			setItem: setItem( memoryStore, allowedKeys, _setItem ),
			getItem: getItem( memoryStore, allowedKeys, _getItem ),
			removeItem: removeItem( memoryStore, allowedKeys, _removeItem ),
			key: key( memoryStore ),
			clear: clear( memoryStore ),
			get length() {
				return length( memoryStore );
			},
		};

		// Redefine `window.localStorage` instead of assigning to localStorage methods
		// like `getItem` and `setItem` because it is not effective in Firefox.
		// https://github.com/whatwg/html/issues/183#issuecomment-142944605
		Object.defineProperty( window, 'localStorage', {
			value: localStorageOverride,
			enumerable: true,
			configurable: true,
		} );
	}
}
