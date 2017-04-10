/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, stub } from 'sinon';

/**
 * Internal dependencies
 */
import { addHandlers, removeHandlers, buildMiddleware } from '../extensions-middleware';
import { local } from '../utils';

describe( 'Calypso Extensions Data Layer Middleware', () => {
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
		const action = { type: 'UNSUPPORTED_ACTION' };

		const extensionHandlers = addHandlers( 'my-extension', {}, {} );
		const middleware = buildMiddleware( extensionHandlers );

		middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.beenCalled;
		expect( next ).to.have.been.calledWith( action );
	} );

	it( 'should pass along local actions untouched', () => {
		const adder = spy();
		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const extensionHandlers = addHandlers( 'my-extension', handlers, {} );
		const middleware = buildMiddleware( extensionHandlers );
		const action = local( { type: 'ADD' } );

		middleware( store )( next )( action );

		expect( next ).to.have.been.calledWith( action );
		expect( adder ).to.not.have.beenCalled;
	} );

	it( 'should not pass along non-local actions with non data-layer meta', () => {
		const adder = spy();
		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const extensionHandlers = addHandlers( 'my-extension', handlers, {} );
		const middleware = buildMiddleware( extensionHandlers );
		const action = { type: 'ADD', meta: { semigroup: true } };

		middleware( store )( next )( action );

		expect( next ).to.not.have.beenCalled;
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should not pass along non-local actions with data-layer meta but no bypass', () => {
		const adder = spy();
		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const extensionHandlers = addHandlers( 'my-extension', handlers, {} );
		const middleware = buildMiddleware( extensionHandlers );
		const action = { type: 'ADD', meta: { dataLayer: { data: 42 } } };

		middleware( store )( next )( action );

		expect( next ).to.not.have.beenCalled;
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should intercept actions in appropriate handler', () => {
		const adder = spy();

		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const extensionHandlers = addHandlers( 'my-extension', handlers, {} );
		const middleware = buildMiddleware( extensionHandlers );
		const action = { type: 'ADD' };

		middleware( store )( next )( action );

		expect( next ).to.not.have.been.calledWith( action );
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should allow continuing the action down the chain', () => {
		const adder = spy( ( _store, _action, _next ) => _next( _action ) );

		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const extensionHandlers = addHandlers( 'my-extension', handlers, {} );
		const middleware = buildMiddleware( extensionHandlers );
		const action = { type: 'ADD' };

		middleware( store )( next )( action );

		expect( next ).to.have.been.calledOnce;
		expect( next ).to.have.been.calledWith( local( action ) );
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should call all given handlers (same list)', () => {
		const adder = spy();
		const doubler = spy();

		const handlers = {
			[ 'MATHS' ]: [ adder, doubler ],
		};

		const extensionHandlers = addHandlers( 'my-extension', handlers, {} );
		const middleware = buildMiddleware( extensionHandlers );
		const action = { type: 'MATHS' };

		middleware( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action );
		expect( doubler ).to.have.been.calledWith( store, action );
		expect( next ).to.not.have.beenCalled;
	} );

	it( 'should call all given handlers (different lists)', () => {
		const adder = spy();
		const doubler = spy();

		const adderHandlers = {
			[ 'MATHS' ]: [ adder ],
		};

		const doublerHandlers = {
			[ 'MATHS' ]: [ doubler ],
		};

		const extensionHandlers1 = addHandlers( 'adder-extension', adderHandlers, {} );
		const extensionHandlers2 = addHandlers( 'doubler-extension', doublerHandlers, extensionHandlers1 );
		const middleware = buildMiddleware( extensionHandlers2 );
		const action = { type: 'MATHS' };

		middleware( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action );
		expect( doubler ).to.have.been.calledWith( store, action );
		expect( next ).to.not.have.beenCalled;
	} );

	it( 'should no longer call handlers that have been removed', () => {
		const adder = spy();

		const handlers = {
			[ 'MATHS' ]: [ adder ],
		};

		const extensionHandlers1 = addHandlers( 'my-extension', handlers, {} );
		const middleware1 = buildMiddleware( extensionHandlers1 );
		const action = { type: 'MATHS' };

		middleware1( store )( next )( action );
		expect( adder ).to.have.been.calledWith( store, action );

		const extensionHandlers2 = removeHandlers( 'my-extension', extensionHandlers1 );
		const middleware2 = buildMiddleware( extensionHandlers2 );

		middleware2( store )( next )( action );
		expect( adder ).to.not.have.beenCalled;
	} );

	it( 'should still call handlers even after some handlers have been removed', () => {
		const adder = spy();
		const doubler = spy();
		const other = spy();

		const adderHandlers = {
			[ 'MATHS' ]: [ adder ],
		};

		const doublerHandlers = {
			[ 'MATHS' ]: [ doubler ],
			[ 'OTHER' ]: [ other ],
		};

		const mathsAction = { type: 'MATHS' };
		const otherAction = { type: 'OTHER' };

		const extensionHandlers1 = addHandlers( 'adder-extension', adderHandlers, {} );
		const extensionHandlers2 = addHandlers( 'doubler-extension', doublerHandlers, extensionHandlers1 );
		const middleware2 = buildMiddleware( extensionHandlers2 );

		middleware2( store )( next )( mathsAction );
		middleware2( store )( next )( otherAction );
		expect( adder ).to.have.been.calledWith( store, mathsAction );
		expect( doubler ).to.have.been.calledWith( store, mathsAction );
		expect( other ).to.have.been.calledWith( store, otherAction );

		const extensionHandlers3 = removeHandlers( 'adder-extension', extensionHandlers2 );
		const middleware3 = buildMiddleware( extensionHandlers3 );

		middleware3( store )( next )( mathsAction );
		middleware3( store )( next )( otherAction );
		expect( adder ).to.have.been.calledOnce;
		expect( doubler ).to.have.been.calledTwice;
		expect( other ).to.have.been.calledTwice;
	} );

	it( 'should throw an Error when trying to add handlers for the same extension twice.', () => {
		const extensionHandlers1 = addHandlers( 'my-extension', {}, {} );

		const willThrow = () => {
			addHandlers( 'my-extension', {}, extensionHandlers1 );
		};

		expect( willThrow ).to.throw( Error );
	} );
} );

