import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { bypassDataLayer } from '../utils';
import { middleware } from '../wpcom-api-middleware';

describe( 'WordPress.com API Middleware', () => {
	let next;
	let store;

	beforeEach( () => {
		next = jest.fn();

		store = {
			dispatch: jest.fn(),
			getState: jest.fn(),
			replaceReducers: jest.fn(),
			subscribe: jest.fn(),
		};

		store.getState.mockReturnValue( Object.create( null ) );
	} );

	test( 'should pass along actions without corresponding handlers', () => {
		const handlers = Object.create( null );
		const action = { type: 'UNSUPPORTED_ACTION' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( store.dispatch ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledWith( action );
	} );

	test( 'should pass along local actions untouched', () => {
		const adder = jest.fn();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = bypassDataLayer( { type: 'ADD' } );

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).toHaveBeenCalledWith( action );
		expect( adder ).not.toHaveBeenCalled();
	} );

	test( 'should pass along non-local actions with non data-layer meta', () => {
		const adder = jest.fn();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD', meta: { semigroup: true } };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( adder ).toHaveBeenCalledWith( store, action );
	} );

	test( 'should pass non-local actions with data-layer meta but no bypass', () => {
		const adder = jest.fn();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD', meta: { dataLayer: { groupoid: 42 } } };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( adder ).toHaveBeenCalledWith( store, action );
	} );

	test( 'should intercept actions in appropriate handler', () => {
		const adder = jest.fn();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).not.toHaveBeenCalledWith( action );
		expect( adder ).toHaveBeenCalledWith( store, action );
	} );

	test( 'should allow continuing the action down the chain', () => {
		const adder = jest.fn( () => {} );
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( next ).toHaveBeenCalledWith( bypassDataLayer( action ) );
		expect( adder ).toHaveBeenCalledWith( store, action );
	} );

	test( 'should call all given handlers (same list)', () => {
		const adder = jest.fn();
		const doubler = jest.fn();
		const handlers = mergeHandlers( {
			[ 'MATHS' ]: [ adder, doubler ],
		} );
		const action = { type: 'MATHS' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( adder ).toHaveBeenCalledWith( store, action );
		expect( doubler ).toHaveBeenCalledWith( store, action );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should call all given handlers (different lists)', () => {
		const adder = jest.fn();
		const doubler = jest.fn();
		const handlers = mergeHandlers(
			{
				[ 'MATHS' ]: [ adder ],
			},
			{
				[ 'MATHS' ]: [ doubler ],
			}
		);
		const action = { type: 'MATHS' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( adder ).toHaveBeenCalledWith( store, action );
		expect( doubler ).toHaveBeenCalledWith( store, action );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	describe( 'network response', () => {
		let adder;
		let handlers;
		const action = { type: 'ADD' };

		beforeEach( () => {
			adder = jest.fn();
			handlers = mergeHandlers( {
				[ 'ADD' ]: [ adder ],
			} );
		} );

		test( 'should not pass along actions for a network response that contains headers', () => {
			const meta = { dataLayer: { headers: {} } };

			middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( {
				...action,
				meta,
			} );

			expect( next ).not.toHaveBeenCalled();
		} );

		test( 'should not pass along actions for a network response that contains data', () => {
			const meta = { dataLayer: { data: {} } };

			middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( {
				...action,
				meta,
			} );

			expect( next ).not.toHaveBeenCalled();
		} );

		test( 'should not pass along actions for a network response that contains an error', () => {
			const meta = { dataLayer: { error: {} } };

			middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( {
				...action,
				meta,
			} );

			expect( next ).not.toHaveBeenCalled();
		} );

		test( 'should not pass along actions for a network response that contains a progress report', () => {
			const meta = { dataLayer: { progress: { total: 1, loaded: 1 } } };

			middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( {
				...action,
				meta,
			} );

			expect( next ).not.toHaveBeenCalled();
		} );
	} );
} );
