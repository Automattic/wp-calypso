/**
 * A localStorage implementation that falls back to in memory storage if:
 * - localStorage isn't available.
 * - setItem throws. This can occur for a number of reasons such as no-disk space, or certain mobile browsers.
 */

/**
 * LocalStorage polyfill from https://gist.github.com/juliocesar/926500
 */
const inMemoryLocalStorage = {
	_data: {} as Record< string, string >,
	setItem: function ( id: string, val: string ) {
		this._data[ id ] = val;
	},
	getItem: function ( id: string ): string | null {
		return this._data.hasOwnProperty( id ) ? this._data[ id ] : null;
	},
	removeItem: function ( id: string ) {
		delete this._data[ id ];
	},
	clear: function () {
		this._data = {};
	},
};

/**
 * We shadow localStorage in memory, so we can fallback to the memory version if anything goes wrong.
 *
 * The main issue is that occasionally storage doesn't work, this protects against that.
 */
let isLocalStorageWorking = true;
const localStorageWithInMemoryFallback = {
	setItem: function ( id: string, val: string ) {
		inMemoryLocalStorage.setItem( id, val );
		try {
			window.localStorage.setItem( id, val );
		} catch ( e ) {
			isLocalStorageWorking = false;
		}
	},
	getItem: function ( id: string ): string | null {
		return isLocalStorageWorking
			? window.localStorage.getItem( id )
			: inMemoryLocalStorage.getItem( id );
	},
	removeItem: function ( id: string ) {
		inMemoryLocalStorage.removeItem( id );
		try {
			window.localStorage.removeItem( id );
		} catch ( e ) {
			isLocalStorageWorking = false;
		}
	},
	clear: function () {
		inMemoryLocalStorage.clear();
		try {
			window.localStorage.clear();
		} catch ( e ) {
			isLocalStorageWorking = false;
		}
	},
};

const localStorage =
	typeof window !== 'undefined' && window.localStorage
		? localStorageWithInMemoryFallback
		: inMemoryLocalStorage;

export default localStorage;
