/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Module variables
 */
const log = debug( 'calypso:local-storage' );

export default function( root ) {
	if ( ! root.localStorage ) {
		log( 'localStorage is missing, setting to polyfill' );
		root.localStorage = {};
	}

	try {
		root.localStorage.setItem( 'localStorageTest', '' );
		root.localStorage.removeItem( 'localStorageTest' );
		log( 'localStorage tested and working correctly' );
	} catch ( error ) {
		log( 'localStorage not working correctly, setting to polyfill' );
		let _data = {};
		Object.setPrototypeOf( root.localStorage, {
			setItem: ( id, val ) => Object.assign( _data, { [ id ]: String( val ) } ),
			getItem: ( id ) => _data.hasOwnProperty( id ) ? _data[ id ] : null,
			removeItem: ( id ) => delete _data[ id ],
			clear: () => _data = {},
			get length() {
				return Object.keys( _data ).length;
			}
		} );
	}
}
