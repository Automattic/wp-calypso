/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, stub } from 'sinon';

/**
 * Internal dependencies
 */
import { bypassDataLayer } from '../utils';
import { middleware } from '../wpcom-api-middleware';
import { mergeHandlers } from 'state/action-watchers/utils';

describe( 'WordPress.com API Middleware', () => {
	let next;
	let store;

	beforeEach( () => {
		next = spy();

		store = {
			dispatch: spy(),
			getState: stub(),
			replaceReducers: spy(),
			subscribe: spy(),
		};

		store.getState.returns( Object.create( null ) );
	} );

	test( 'should pass along actions without corresponding handlers', () => {
		const handlers = Object.create( null );
		const action = { type: 'UNSUPPORTED_ACTION' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( store.dispatch ).to.not.have.been.called;
		expect( next ).to.have.been.calledWith( action );
	} );

	test( 'should pass along local actions untouched', () => {
		const adder = spy();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = bypassDataLayer( { type: 'ADD' } );

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).to.have.been.calledWith( action );
		expect( adder ).to.not.have.been.called;
	} );

	test( 'should pass along non-local actions with non data-layer meta', () => {
		const adder = spy();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD', meta: { semigroup: true } };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).to.have.been.calledOnce;
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	test( 'should pass non-local actions with data-layer meta but no bypass', () => {
		const adder = spy();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD', meta: { dataLayer: { groupoid: 42 } } };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).to.have.been.calledOnce;
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	test( 'should intercept actions in appropriate handler', () => {
		const adder = spy();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).to.not.have.been.calledWith( action );
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	test( 'should allow continuing the action down the chain', () => {
		const adder = spy( () => {} );
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( next ).to.have.been.calledOnce;
		expect( next ).to.have.been.calledWith( bypassDataLayer( action ) );
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	test( 'should call all given handlers (same list)', () => {
		const adder = spy();
		const doubler = spy();
		const handlers = mergeHandlers( {
			[ 'MATHS' ]: [ adder, doubler ],
		} );
		const action = { type: 'MATHS' };

		middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action );
		expect( doubler ).to.have.been.calledWith( store, action );
		expect( next ).to.have.been.calledOnce;
	} );

	test( 'should call all given handlers (different lists)', () => {
		const adder = spy();
		const doubler = spy();
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

		expect( adder ).to.have.been.calledWith( store, action );
		expect( doubler ).to.have.been.calledWith( store, action );
		expect( next ).to.have.been.calledOnce;
	} );

	describe( 'network response', () => {
		let adder;
		let handlers;
		const action = { type: 'ADD' };

		beforeEach( () => {
			adder = spy();
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

			expect( next ).to.have.not.been.called;
		} );

		test( 'should not pass along actions for a network response that contains data', () => {
			const meta = { dataLayer: { data: {} } };

			middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( {
				...action,
				meta,
			} );

			expect( next ).to.have.not.been.called;
		} );

		test( 'should not pass along actions for a network response that contains an error', () => {
			const meta = { dataLayer: { error: {} } };

			middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( {
				...action,
				meta,
			} );

			expect( next ).to.have.not.been.called;
		} );

		test( 'should not pass along actions for a network response that contains a progress report', () => {
			const meta = { dataLayer: { progress: { total: 1, loaded: 1 } } };

			middleware( ( actionType ) => handlers[ actionType ] )( store )( next )( {
				...action,
				meta,
			} );

			expect( next ).to.have.not.been.called;
		} );
	} );
} );
