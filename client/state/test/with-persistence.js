/**
 * Internal dependencies
 */
import { withPersistence, serialize, deserialize, combineReducers } from 'calypso/state/utils';

describe( 'withPersistence', () => {
	const countReducer = ( state = 0, action ) => {
		switch ( action.type ) {
			case 'INC':
				return state + 1;
			default:
				return state;
		}
	};

	test( 'enables persistence with identity transform', () => {
		const reducer = combineReducers( { count: withPersistence( countReducer ) } );

		// handles normal actions without disruption
		expect( reducer( { count: 1 }, { type: 'INC' } ) ).toEqual( { count: 2 } );

		// serializes the state
		expect( serialize( reducer, { count: 2 } ).root() ).toEqual( { count: 2 } );

		// deserializes the state
		expect( deserialize( reducer, { count: 3 } ) ).toEqual( { count: 3 } );

		// just make sure that reducer without `withPersistence` indeed has no persistence
		const reducerWithoutPersistence = combineReducers( { count: countReducer } );
		expect( serialize( reducerWithoutPersistence, { count: 2 } ) ).toBeUndefined();
		expect( deserialize( reducerWithoutPersistence, { count: 2 } ) ).toEqual( { count: 0 } );
	} );

	test( 'enables persistence with custom serialize', () => {
		const reducer = combineReducers( {
			count: withPersistence( countReducer, {
				// never store unlucky numbers
				serialize: ( state ) => ( state === 13 ? 12 : state ),
			} ),
		} );

		// serializes the state with the custom handler
		expect( serialize( reducer, { count: 13 } ).root() ).toEqual( { count: 12 } );

		// deserializes the state with identity
		expect( deserialize( reducer, { count: 13 } ) ).toEqual( { count: 13 } );
	} );

	test( 'enables persistence with custom deserialize', () => {
		const reducer = combineReducers( {
			count: withPersistence( countReducer, {
				// don't load counters that are too small
				deserialize: ( state ) => ( state > 10 ? state : 0 ),
			} ),
		} );

		// serializes the state with identity
		expect( serialize( reducer, { count: 5 } ).root() ).toEqual( { count: 5 } );

		// deserializes the state with custom handler
		expect( deserialize( reducer, { count: 5 } ) ).toEqual( { count: 0 } );
	} );
} );
