/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';

import constants from 'lib/invites/constants';

describe( 'List Invites Store', function() {
	let ListInvitesStore;
	const siteId = 123;
	const actions = {
		receiveInvites: {
			type: constants.action.RECEIVE_INVITES,
			siteId: siteId,
			offset: 0,
			data: {
				found: 2,
				invites: [
					{
						invite_key: 'asdf1234',
						role: 'editor',
						user: {
							ID: 1234,
							name: 'Test One'
						}
					}
				]
			}
		},
		receiveMoreInvites: {
			type: constants.action.RECEIVE_INVITES,
			siteId: siteId,
			offset: 0,
			data: {
				found: 2,
				invites: [
					{
						invite_key: 'asdf5678',
						role: 'contributor',
						user: {
							ID: 1234,
							name: 'Test Two'
						}
					}
				]
			}
		}
	};

	beforeEach( function() {
		ListInvitesStore = require( 'lib/invites/stores/invites-list' );
	} );

	describe( 'Listing invites', function() {
		beforeEach( function() {
			Dispatcher.handleServerAction( actions.receiveInvites );
		} );

		it( 'List of invites should be an object', function() {
			const invites = ListInvitesStore.getInvites( siteId );
			assert.isObject( invites );
		} );

		it( 'Fetching more invites should add to the object', function() {
			const invites = ListInvitesStore.getInvites( siteId );
			let invitesAgain = [];
			assert.equal( 1, invites.size );
			Dispatcher.handleServerAction( actions.receiveMoreInvites );
			invitesAgain = ListInvitesStore.getInvites( siteId );
			assert.equal( 2, invitesAgain.size );
		} );
	} );
} );
