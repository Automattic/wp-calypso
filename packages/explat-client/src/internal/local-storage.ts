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
					return ( this._data[ id ] = String( val ) );
				},
				getItem: function ( id: string ) {
					return this._data.hasOwnProperty( id ) ? this._data[ id ] : undefined;
				},
				removeItem: function ( id: string ) {
					return delete this._data[ id ];
				},
				clear: function () {
					return ( this._data = {} );
				},
		  };

export default localStorage;
