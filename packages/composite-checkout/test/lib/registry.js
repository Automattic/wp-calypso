// This is required to fix the "regeneratorRuntime is not defined" error
require( '@babel/polyfill' );

/**
 * Internal dependencies
 */
import { createRegistry } from '../../src/lib/registry';

/* eslint-disable no-console */
const original = console.log;

describe( 'createRegistry', function() {
	beforeEach( () => {
		console.log = jest.fn();
	} );

	afterEach( () => {
		console.log = original;
	} );

	it( 'returns a registry object with the correct properties', function() {
		const registry = createRegistry();
		expect( registry ).toHaveProperty( 'registerStore' );
		expect( registry ).toHaveProperty( 'subscribe' );
		expect( registry ).toHaveProperty( 'dispatch' );
		expect( registry ).toHaveProperty( 'select' );
	} );

	describe( 'dispatch', function() {
		it( 'returns action creators registered by registerStore', function() {
			const { registerStore, dispatch } = createRegistry();
			const actions = {
				setName( payload ) {
					return { type: 'NAME_SET', payload };
				},
			};
			registerStore( 'test', { actions } );
			expect( dispatch( 'test' ) ).toHaveProperty( 'setName' );
		} );

		it( 'returns action creators that are bound to run the reducer and change the state', function() {
			const { registerStore, dispatch, select } = createRegistry();
			const actions = {
				setName( payload ) {
					return { type: 'NAME_SET', payload };
				},
			};
			const reducer = ( state, action ) => {
				switch ( action.type ) {
					case 'NAME_SET':
						return { ...state, name: action.payload };
				}
				return state;
			};
			const selectors = {
				getName( state ) {
					return state.name;
				},
			};
			registerStore( 'test', { reducer, actions, selectors } );
			dispatch( 'test' ).setName( 'picard' );
			const name = select( 'test' ).getName();
			expect( name ).toEqual( 'picard' );
		} );
	} );
} );
/* eslint-enable no-console */
