/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, stub } from 'sinon';

/**
 * Internal dependencies
 */
import { extensionsHandlers } from '../extensions-middleware';
import { local } from '../utils';

describe( 'Calypso Extensions Data Layer Middleware', () => {
	let next;
	let store;
	let middleware;
	let addHandlers;

	beforeEach( () => {
		const handlers = extensionsHandlers();

		next = spy();

		store = {
			dispatch: spy(),
			getState: stub(),
			replaceReducers: spy(),
			subscribe: spy(),
		};

		store.getState.returns( Object.create( null ) );

		middleware = handlers.middleware;
		addHandlers = handlers.addHandlers;
	} );

	it( 'should pass along actions without corresponding handlers', () => {
		const action = { type: 'UNSUPPORTED_ACTION' };

		addHandlers( Object.create( null ) );
		middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
	} );

	it( 'should pass along local actions untouched', () => {
		const adder = spy();

		addHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = local( { type: 'ADD' } );

		middleware( store )( next )( action );

		expect( next ).to.have.been.calledWith( action );
		expect( adder ).to.not.have.beenCalled;
	} );

	it( 'should not pass along non-local actions with non data-layer meta', () => {
		const adder = spy();

		addHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD', meta: { semigroup: true } };

		middleware( store )( next )( action );

		expect( next ).to.not.have.beenCalled;
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should not pass along non-local actions with data-layer meta but no bypass', () => {
		const adder = spy();

		addHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD', meta: { dataLayer: { data: 42 } } };

		middleware( store )( next )( action );

		expect( next ).to.not.have.beenCalled;
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should intercept actions in appropriate handler', () => {
		const adder = spy();

		addHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD' };

		middleware( store )( next )( action );

		expect( next ).to.not.have.been.calledWith( action );
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should allow continuing the action down the chain', () => {
		const adder = spy( ( _store, _action, _next ) => _next( _action ) );

		addHandlers( {
			[ 'ADD' ]: [ adder ],
		} );
		const action = { type: 'ADD' };

		middleware( store )( next )( action );

		expect( next ).to.have.been.calledOnce;
		expect( next ).to.have.been.calledWith( local( action ) );
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should call all given handlers (same list)', () => {
		const adder = spy();
		const doubler = spy();

		addHandlers( {
			[ 'MATHS' ]: [ adder, doubler ],
		} );
		const action = { type: 'MATHS' };

		middleware( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action );
		expect( doubler ).to.have.been.calledWith( store, action );
		expect( next ).to.not.have.beenCalled;
	} );

	it( 'should call all given handlers (different lists)', () => {
		const adder = spy();
		const doubler = spy();

		addHandlers( {
			[ 'MATHS' ]: [ adder ],
		} );

		addHandlers( {
			[ 'MATHS' ]: [ doubler ],
		} );

		const action = { type: 'MATHS' };

		middleware( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action );
		expect( doubler ).to.have.been.calledWith( store, action );
		expect( next ).to.not.have.beenCalled;
	} );

	it( 'should no longer call handlers that have been removed', () => {
		const adder = spy();

		const removeAdder = addHandlers( {
			[ 'MATHS' ]: [ adder ],
		} );
		const action = { type: 'MATHS' };

		middleware( store )( next )( action );
		expect( adder ).to.have.been.calledWith( store, action );

		removeAdder();

		middleware( store )( next )( action );
		expect( adder ).to.not.have.beenCalled;
	} );

	it( 'should still call handlers even after some handlers have been removed', () => {
		const adder = spy();
		const doubler = spy();
		const other = spy();

		const removeAdder = addHandlers( {
			[ 'MATHS' ]: [ adder ],
		} );

		addHandlers( {
			[ 'MATHS' ]: [ doubler ],
			[ 'OTHER' ]: [ other ],
		} );

		const mathsAction = { type: 'MATHS' };
		const otherAction = { type: 'OTHER' };

		middleware( store )( next )( mathsAction );
		middleware( store )( next )( otherAction );
		expect( adder ).to.have.been.calledWith( store, mathsAction );
		expect( doubler ).to.have.been.calledWith( store, mathsAction );
		expect( other ).to.have.been.calledWith( store, otherAction );

		removeAdder();

		middleware( store )( next )( mathsAction );
		middleware( store )( next )( otherAction );
		expect( adder ).to.have.been.calledOnce;
		expect( doubler ).to.have.been.calledTwice;
		expect( other ).to.have.been.calledTwice;
	} );
} );

