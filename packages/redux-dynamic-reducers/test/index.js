/** @format */

/**
 * Internal dependencies
 */
import { createDynamicReducer } from '../';

const dummy = () => {
	let items = {
		id: 5,
		'redux-fruits': [ 'apple', 'pear', 'persimmon' ],
		'redux-status.hasEaten': false,
	};

	return createDynamicReducer( {
		storageAPI: {
			length: () => Promise.resolve( Object.keys( items ).length ),
			key: n => Promise.resolve( Object.keys( items )[ n ] ),
			getItem: key => Promise.resolve( items[ key ] ),
			setItem: ( key, value ) => Promise.resolve( ( items[ key ] = value ) ),
			removeItem: key => Promise.resolve( ( delete items[ key ], null ) ),
			clear: () => Promise.resolve( ( ( items = {} ), undefined ) ),
		},
		keyPrefix: 'redux',
	} );
};

describe( 'everything', () => {
	it( 'works', done => {
		dummy().then( ( { reducer } ) => {
			expect( reducer( {}, 'TEST' ) ).toHaveProperty( 'fruits' );
			done();
		} );
	} );

	it( 'loads a reducer', done => {
		dummy().then( ( { registerReducer, reducer } ) => {
			expect( reducer( {}, 'TEST' ) ).toNotHaveProperty( 'flies' );
			registerReducer( 'flies', () => 'please no' );
			expect( reducer( {}, 'TEST' ) ).toHaveProperty( 'flies' );
			done();
		} );
	} );
} );
