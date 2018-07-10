/**
 * Internal dependencies
 */
import withHistory from '../';

describe( 'withHistory', () => {
	const counter = ( state = 0, { type } ) => (
		type === 'INCREMENT' ? state + 1 : state
	);

	it( 'should return a new reducer', () => {
		const reducer = withHistory()( counter );

		expect( typeof reducer ).toBe( 'function' );
		expect( reducer( undefined, {} ) ).toEqual( {
			past: [],
			present: 0,
			future: [],
		} );
	} );

	it( 'should track history', () => {
		const reducer = withHistory()( counter );

		let state;
		state = reducer( undefined, {} );
		state = reducer( state, { type: 'INCREMENT' } );

		expect( state ).toEqual( {
			past: [ 0 ],
			present: 1,
			future: [],
		} );

		state = reducer( state, { type: 'INCREMENT' } );

		expect( state ).toEqual( {
			past: [ 0, 1 ],
			present: 2,
			future: [],
		} );
	} );

	it( 'should perform undo', () => {
		const reducer = withHistory()( counter );

		let state;
		state = reducer( undefined, {} );
		state = reducer( state, { type: 'INCREMENT' } );
		state = reducer( state, { type: 'UNDO' } );

		expect( state ).toEqual( {
			past: [],
			present: 0,
			future: [ 1 ],
		} );
	} );

	it( 'should not perform undo on empty past', () => {
		const reducer = withHistory()( counter );
		const state = reducer( undefined, {} );

		expect( state ).toBe( reducer( state, { type: 'UNDO' } ) );
	} );

	it( 'should perform redo', () => {
		const reducer = withHistory()( counter );

		let state;
		state = reducer( undefined, {} );
		state = reducer( state, { type: 'INCREMENT' } );
		state = reducer( state, { type: 'UNDO' } );
		state = reducer( state, { type: 'REDO' } );

		expect( state ).toEqual( {
			past: [ 0 ],
			present: 1,
			future: [],
		} );
	} );

	it( 'should not perform redo on empty future', () => {
		const reducer = withHistory()( counter );
		const state = reducer( undefined, {} );

		expect( state ).toBe( reducer( state, { type: 'REDO' } ) );
	} );

	it( 'should reset history by options.resetTypes', () => {
		const reducer = withHistory( { resetTypes: [ 'RESET_HISTORY' ] } )( counter );

		let state;
		state = reducer( undefined, {} );
		state = reducer( state, { type: 'INCREMENT' } );
		state = reducer( state, { type: 'RESET_HISTORY' } );

		expect( state ).toEqual( {
			past: [],
			present: 1,
			future: [],
		} );
	} );

	it( 'should ignore history by options.ignoreTypes', () => {
		const reducer = withHistory( { ignoreTypes: [ 'INCREMENT' ] } )( counter );

		let state;
		state = reducer( undefined, {} );
		state = reducer( state, { type: 'INCREMENT' } );
		state = reducer( state, { type: 'INCREMENT' } );

		expect( state ).toEqual( {
			past: [ 0 ], // Needs at least one history
			present: 2,
			future: [],
		} );
	} );

	it( 'should return same reference if state has not changed', () => {
		const reducer = withHistory()( counter );
		const original = reducer( undefined, {} );
		const state = reducer( original, {} );

		expect( state ).toBe( original );
	} );

	it( 'should overwrite present state with option.shouldOverwriteState', () => {
		const reducer = withHistory( {
			shouldOverwriteState: ( { type } ) => type === 'INCREMENT',
		} )( counter );

		let state;
		state = reducer( undefined, {} );
		state = reducer( state, { type: 'INCREMENT' } );

		expect( state ).toEqual( {
			past: [ 0 ],
			present: 1,
			future: [],
		} );

		state = reducer( state, { type: 'INCREMENT' } );

		expect( state ).toEqual( {
			past: [ 0 ],
			present: 2,
			future: [],
		} );
	} );

	it( 'should create undo level with option.shouldOverwriteState and CREATE_UNDO_LEVEL', () => {
		const reducer = withHistory( {
			shouldOverwriteState: ( { type } ) => type === 'INCREMENT',
		} )( counter );

		let state;
		state = reducer( undefined, {} );
		state = reducer( state, { type: 'INCREMENT' } );
		state = reducer( state, { type: 'CREATE_UNDO_LEVEL' } );

		expect( state ).toEqual( {
			past: [ 0 ],
			present: 1,
			future: [],
		} );

		state = reducer( state, { type: 'INCREMENT' } );

		expect( state ).toEqual( {
			past: [ 0, 1 ],
			present: 2,
			future: [],
		} );
	} );
} );
