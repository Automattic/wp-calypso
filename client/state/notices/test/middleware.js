/**
 * External dependencies
 */
import sinon from 'sinon';
import { noop } from 'lodash';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

/**
 * Internal dependencies
 */
import noticesMiddleware, { handlers } from '../middleware';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import { successNotice, withoutNotice } from 'calypso/state/notices/actions';
import { useSandbox } from 'calypso/test-helpers/use-sinon';

describe( 'middleware', () => {
	describe( 'noticesMiddleware()', () => {
		let store;
		let dispatchSpy;
		useSandbox( ( sandbox ) => {
			const spyMiddleware = () => ( next ) => {
				dispatchSpy = sandbox.spy( next );
				return ( action ) => dispatchSpy( action );
			};

			store = applyMiddleware( thunk, spyMiddleware )( createStore )( () => 'Hello' );
		} );

		beforeAll( () => {
			handlers.DUMMY_TYPE = ( action ) => ( dispatch, getState ) =>
				dispatch( successNotice( `${ getState() } ${ action.target }` ) );
		} );

		afterAll( () => {
			delete handlers.DUMMY_TYPE;
		} );

		const dummyCreator = ( target ) => ( { type: 'DUMMY_TYPE', target } );

		test( 'should trigger the observer corresponding to the dispatched action type', () => {
			noticesMiddleware( store )( noop )( dummyCreator( 'World' ) );

			sinon.assert.calledWithMatch( dispatchSpy, {
				type: NOTICE_CREATE,
				notice: { text: 'Hello World' },
			} );
		} );

		test( 'should not trigger the observer when meta.notices.skip is set to true', () => {
			noticesMiddleware( store )( noop )( withoutNotice( dummyCreator )( 'World' ) );

			sinon.assert.notCalled( dispatchSpy );
		} );
	} );
} );
