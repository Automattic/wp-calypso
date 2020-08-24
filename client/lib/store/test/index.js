/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy, stub } from 'sinon';

/**
 * Internal dependencies
 */
import { createReducerStore } from './../index';
import Dispatcher from 'dispatcher';

describe( 'index', () => {
	const reducer = ( state ) => {
		return state;
	};

	test( 'should be a function', () => {
		expect( createReducerStore ).to.be.a( 'function' );
	} );

	test( 'should create an object instance', () => {
		expect( createReducerStore( reducer ) ).to.be.a( 'object' );
	} );

	test( 'should create new object instance each time', () => {
		expect( createReducerStore( reducer ) ).to.be.not.equal( createReducerStore( reducer ) );
	} );

	test( 'should have empty object as a default state', () => {
		const store = createReducerStore( reducer );

		expect( store.get() ).to.be.eql( {} );
	} );

	test( 'should have passed state object as a state', () => {
		const state = { test: 1 },
			store = createReducerStore( reducer, state );

		expect( store.get() ).to.be.equal( state );
	} );

	test( 'should call reducer when action is triggered', () => {
		const state = { test: 2 },
			reducerStub = stub().returns( state ),
			store = createReducerStore( reducerStub, state );

		Dispatcher.handleViewAction( {
			type: 'anything',
		} );

		expect( reducerStub ).to.have.been.calledOnce;
		expect( store.get() ).to.be.equal( state );
	} );

	test( 'should not trigger change event when reducer does not change state', () => {
		const state = {},
			store = createReducerStore( reducer, state ),
			callbackSpy = spy();

		store.on( 'change', callbackSpy );

		Dispatcher.handleViewAction( {
			type: 'anything',
		} );

		expect( store.get() ).to.be.equal( state );
		expect( callbackSpy ).to.have.not.been.called;
	} );

	test( 'should trigger change event when reducer changes state', () => {
		const state = { test: 3 },
			store = createReducerStore( () => ( { test: 4 } ), state ),
			callbackSpy = spy();

		store.on( 'change', callbackSpy );

		Dispatcher.handleViewAction( {
			type: 'anything',
		} );

		expect( store.get() ).to.be.not.equal( state );
		expect( callbackSpy ).to.have.been.calledOnce;
	} );

	test( 'should trigger change event only for actions specified in reducer', () => {
		const TEST = 'test',
			VALUE = 'value',
			state = { test: 3 },
			store = createReducerStore( ( oldState, payload ) => {
				const {
					action: { type, key },
				} = payload;

				if ( type === TEST ) {
					return {
						test: key,
					};
				}

				return oldState;
			}, state ),
			callbackSpy = spy();

		store.on( 'change', callbackSpy );

		Dispatcher.handleViewAction( {
			type: 'anything',
			key: 'anything',
		} );
		Dispatcher.handleViewAction( {
			type: TEST,
			key: 'anything',
		} );
		Dispatcher.handleViewAction( {
			type: TEST,
			key: VALUE,
		} );

		expect( store.get() ).to.be.not.equal( state );
		expect( store.get() ).to.be.eql( {
			test: VALUE,
		} );
		expect( callbackSpy ).to.have.been.calledTwice;
	} );
} );
