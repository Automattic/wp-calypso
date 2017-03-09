/* eslint-disable no-var */

// Test in case we are in safari private mode which fails on any storage
try {
	window.localStorage.setItem( 'localStorageTest', '' );
	window.localStorage.removeItem( 'localStorageTest' );
} catch ( error ) {
	var _data = {};

	if ( ! window.localStorage ) {
		window.localStorage = {};
	}

	// We can't replace window.localStorage, but we can replace its methods
	window.localStorage.setItem = function( id, val ) {
		_data[ id ] = String( val );
		return _data[ id ];
	};

	window.localStorage.getItem = function( id ) {
		return _data.hasOwnProperty( id ) ? _data[ id ] : null;
	};

	window.localStorage.removeItem = function( id ) {
		return delete _data[ id ];
	};

	window.localStorage.clear = function() {
		_data = {};
		return _data;
	};

	window.localStorage.__defineGetter__( 'length', function() {
		return Object.keys( _data ).length;
	} );
}
