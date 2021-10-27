/**
 * A polyfilled LocalStorage.
 * The polyfill is required at least for testing.
 */
const localStorage =
	typeof window !== 'undefined' && window.localStorage
		? window.localStorage
		: // LocalStorage polyfill from https://gist.github.com/juliocesar/926500
		  {
				_data: {} as Record< string, string >,
				setItem: function ( id: string, val: string ) {
					this._data[ id ] = val;
				},
				getItem: function ( id: string ) {
					return this._data.hasOwnProperty( id ) ? this._data[ id ] : undefined;
				},
				removeItem: function ( id: string ) {
					delete this._data[ id ];
				},
				clear: function () {
					this._data = {};
				},
				get length() {
					return Object.keys( this._data ).length;
				},
				key: function ( index: number ): string | undefined {
					const arr = this._data.keys;
					return arr[ index ];
				},
		  };

export default localStorage;
