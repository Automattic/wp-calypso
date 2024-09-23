import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import {
	createListenerMiddleware,
	addListeners,
	removeListeners,
	clearListeners,
} from '../create-listener-middleware';

describe( 'createListenerMiddleware', () => {
	test( 'should create a middleware function', () => {
		const middleware = createListenerMiddleware();
		expect( typeof middleware ).toBe( 'function' );
	} );

	test( 'should call registered listeners when an action is dispatched', () => {
		const middleware = createListenerMiddleware();
		const store = createStore( ( state ) => state, applyMiddleware( middleware ) );

		const listener = jest.fn();

		store.dispatch(
			addListeners( {
				TEST_ACTION: [ listener ],
			} )
		);

		store.dispatch( { type: 'TEST_ACTION' } );
		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( listener ).toHaveBeenCalledWith(
			{ getState: store.getState, dispatch: expect.any( Function ) },
			{ type: 'TEST_ACTION' }
		);
	} );

	test( 'should not call listeners for unregistered action types', () => {
		const middleware = createListenerMiddleware();
		const store = createStore( ( state ) => state, applyMiddleware( middleware ) );

		const listener = jest.fn();

		store.dispatch(
			addListeners( {
				TEST_ACTION: [ listener ],
			} )
		);

		store.dispatch( { type: 'UNREGISTERED_ACTION' } );

		expect( listener ).not.toHaveBeenCalled();
	} );

	test( 'should allow removing listeners', () => {
		const middleware = createListenerMiddleware();
		const store = createStore( ( state ) => state, applyMiddleware( middleware ) );

		const listener = jest.fn();

		store.dispatch(
			addListeners( {
				TEST_ACTION: [ listener ],
			} )
		);
		store.dispatch(
			removeListeners( {
				TEST_ACTION: [ listener ],
			} )
		);

		store.dispatch( { type: 'TEST_ACTION' } );
		expect( listener ).not.toHaveBeenCalled();
	} );

	test( 'should allow clearing listeners', () => {
		const middleware = createListenerMiddleware();
		const store = createStore( ( state ) => state, applyMiddleware( middleware ) );

		const listener = jest.fn();

		store.dispatch(
			addListeners( {
				TEST_ACTION: [ listener ],
			} )
		);

		store.dispatch( clearListeners() );

		store.dispatch( { type: 'TEST_ACTION' } );
		expect( listener ).not.toHaveBeenCalled();
	} );
} );
