/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, stub } from 'sinon';

/**
 * Internal dependencies
 */
import { addHandlers, removeHandlers, configureMiddleware } from '../extensions-middleware';
import { bypassDataLayer } from '../utils';

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

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', {}, config );

		config.middleware( store )( next )( action );

		expect( store.dispatch ).to.not.have.been.called;
		expect( next ).to.have.been.calledWith( action );
	} );

	it( 'should pass along local actions untouched', () => {
		const adder = spy();
		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', handlers, config );
		const action = bypassDataLayer( { type: 'ADD' } );

		config.middleware( store )( next )( action );

		expect( next ).to.have.been.calledWith( action );
		expect( adder ).to.not.have.been.called;
	} );

	it( 'should pass along non-local actions with non data-layer meta', () => {
		const adder = spy();
		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', handlers, config );
		const action = { type: 'ADD', meta: { semigroup: true } };

		config.middleware( store )( next )( action );

		expect( next ).to.have.been.calledOnce;
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should pass along non-local actions with data-layer meta but no bypass', () => {
		const adder = spy();
		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', handlers, config );
		const action = { type: 'ADD', meta: { dataLayer: { groupoid: 42 } } };

		config.middleware( store )( next )( action );

		expect( next ).to.have.been.called;
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should intercept actions in appropriate handler', () => {
		const adder = spy();

		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', handlers, config );
		const action = { type: 'ADD' };

		config.middleware( store )( next )( action );

		expect( next ).to.not.have.been.calledWith( action );
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should allow continuing the action down the chain', () => {
		const adder = spy( () => {} );

		const handlers = {
			[ 'ADD' ]: [ adder ],
		};

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', handlers, config );
		const action = { type: 'ADD' };

		config.middleware( store )( next )( action );

		expect( next ).to.have.been.calledOnce;
		expect( next ).to.have.been.calledWith( bypassDataLayer( action ) );
		expect( adder ).to.have.been.calledWith( store, action );
	} );

	it( 'should call all given handlers (same list)', () => {
		const adder = spy();
		const doubler = spy();

		const handlers = {
			[ 'MATHS' ]: [ adder, doubler ],
		};

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', handlers, config );
		const action = { type: 'MATHS' };

		config.middleware( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action );
		expect( doubler ).to.have.been.calledWith( store, action );
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

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'adder-extension', adderHandlers, config );
		addHandlers( 'doubler-extension', doublerHandlers, config );
		const action = { type: 'MATHS' };

		config.middleware( store )( next )( action );

		expect( adder ).to.have.been.calledWith( store, action );
		expect( doubler ).to.have.been.calledWith( store, action );
	} );

	it( 'should no longer call handlers that have been removed', () => {
		const adder = spy();

		const handlers = {
			[ 'MATHS' ]: [ adder ],
		};

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', handlers, config );
		const action = { type: 'MATHS' };

		config.middleware( store )( next )( action );
		expect( adder ).to.have.been.calledWith( store, action );

		removeHandlers( 'my-extension', config );

		adder.reset();
		config.middleware( store )( next )( action );
		expect( adder ).to.not.have.been.called;
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

		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'adder-extension', adderHandlers, config );
		addHandlers( 'doubler-extension', doublerHandlers, config );

		config.middleware( store )( next )( mathsAction );
		config.middleware( store )( next )( otherAction );
		expect( adder ).to.have.been.calledWith( store, mathsAction );
		expect( doubler ).to.have.been.calledWith( store, mathsAction );
		expect( other ).to.have.been.calledWith( store, otherAction );

		removeHandlers( 'adder-extension', config );

		config.middleware( store )( next )( mathsAction );
		config.middleware( store )( next )( otherAction );
		expect( adder ).to.have.been.calledOnce;
		expect( doubler ).to.have.been.calledTwice;
		expect( other ).to.have.been.calledTwice;
	} );

	it( 'should return false when trying to add handlers for the same extension twice.', () => {
		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', {}, config );

		expect( addHandlers( 'my-extension', {}, config ) ).to.eql( false );
	} );

	it( 'should return false when trying to remove handlers for the same extension twice.', () => {
		const config = configureMiddleware( Object.create( null ), Object.create( null ) );
		addHandlers( 'my-extension', {}, config );

		expect( removeHandlers( 'my-extension', config ) ).to.eql( true );
		expect( removeHandlers( 'my-extension', config ) ).to.eql( false );
	} );

	it( 'should create a new middleware and handleAction function each time it is reconfigured.', () => {
		const config = configureMiddleware( {}, { store: {}, next: () => {} } );
		const middleware1 = config.middleware;
		const handleAction1 = config.handleAction;

		addHandlers( 'my-extension', {}, config );
		const middleware2 = config.middleware;
		const handleAction2 = config.handleAction;

		expect( middleware1 ).to.not.equal( middleware2 );
		expect( handleAction1 ).to.not.equal( handleAction2 );
	} );
} );
