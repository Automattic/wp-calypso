/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, stub } from 'sinon';

/**
 * Internal dependencies
 */
import { middleware } from '../wpcom-api-middleware';
import { local, mergeHandlers } from '../utils';

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

	it( 'should pass along actions without corresponding handlers', () => {
		const handlers = Object.create( null );
		const action = { type: 'UNSUPPORTED_ACTION' };

		middleware( handlers )( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
	} );

	it( 'should pass along local actions untouched', () => {
		const adder = spy();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = local( { type: 'ADD' } );

		middleware( handlers )( store )( next )( action );

		expect( next ).to.have.been.calledWith( action );
		expect( adder ).to.not.have.beenCalled;
	} );

	it( 'should intercept actions in appropriate handler', () => {
		const adder = spy();
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD' };

		middleware( handlers )( store )( next )( action );

		expect( next ).to.not.have.been.calledWith( action );
		expect( adder ).to.have.been.calledWith( store, action, next );
	} );

	it( 'should allow continuing the action down the chain', () => {
		const sentinel = { type: 'SENTINEL' };
		const adder = spy( () => next( sentinel ) );
		const handlers = mergeHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD' };

		middleware( handlers )( store )( next )( action );

		expect( next ).to.have.been.calledOnce;
		expect( next ).to.have.been.calledWith( sentinel );
		expect( adder ).to.have.been.calledWith( store, action, next );
	} );

	it( 'should call all given handlers (same list)', () => {
		const adder = spy();
		const doubler = spy();
		const handlers = mergeHandlers( {
			[ 'MATHS' ]: [ adder, doubler ],
		} );
		const action = { type: 'MATHS' };

		middleware( handlers )( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action, next );
		expect( doubler ).to.have.been.calledWith( store, action, next );
		expect( next ).to.not.have.beenCalled;
	} );

	it( 'should call all given handlers (different lists)', () => {
		const adder = spy();
		const doubler = spy();
		const handlers = mergeHandlers( {
			[ 'MATHS' ]: [ adder ],
		}, {
			[ 'MATHS' ]: [ doubler ],
		} );
		const action = { type: 'MATHS' };

		middleware( handlers )( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action, next );
		expect( doubler ).to.have.been.calledWith( store, action, next );
		expect( next ).to.not.have.beenCalled;
	} );
} );
