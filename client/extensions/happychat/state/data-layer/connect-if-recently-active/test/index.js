/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import * as selectors from 'extensions/happychat/state/selectors';
import connectIfRecentlyActive from '../index';

describe( 'HAPPYCHAT_INITIALIZE action', () => {
	// TODO: This test is only complicated because connectIfRecentlyActive calls
	// connectChat directly, and since both are in the same module we can't stub
	// connectChat. So we need to build up all the objects to make connectChat execute
	// without errors. It may be worth pulling each of these helpers out into their
	// own modules, so that we can stub them and simplify our tests.
	const uninitializedState = deepFreeze( {
		currentUser: { id: 1, capabilities: {} },
		extensions: { happychat: { connectionStatus: 'uninitialized' } },
		users: { items: { 1: {} } },
		help: { selectedSiteId: 2647731 },
		sites: {
			items: {
				2647731: {
					ID: 2647731,
					name: 'Manual Automattic Updates',
				}
			}
		}
	} );
	let connection, store;

	useSandbox( sandbox => {
		sandbox.stub( selectors, 'wasHappychatRecentlyActive' );
		connection = {
			on: sandbox.stub()
		};
		// Need to add return value after re-assignment, otherwise it will return
		// a reference to the previous (undefined) connection variable.
		connection.on.returns( connection );
		store = {
			dispatch: noop,
			getState: sandbox.stub().returns( uninitializedState ),
		};
	} );

	it( 'should connect the chat if user was recently connected', () => {
		selectors.wasHappychatRecentlyActive.returns( true );
		connectIfRecentlyActive( connection )( store );
		expect( connection.on ).to.have.been.called;
	} );

	it( 'should not connect the chat if user was not recently connected', () => {
		selectors.wasHappychatRecentlyActive.returns( false );
		connectIfRecentlyActive( connection )( store );
		expect( connection.on ).not.to.have.been.called;
	} );
} );
