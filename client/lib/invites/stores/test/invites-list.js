/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import { action as ActionTypes } from 'lib/invites/constants';

describe( 'List Invites Store', () => {
	let ListInvitesStore;
	const siteId = 123;
	const actions = {
		receiveInvites: {
			type: ActionTypes.RECEIVE_INVITES,
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
							name: 'Test One',
						},
					},
				],
			},
		},
		receiveMoreInvites: {
			type: ActionTypes.RECEIVE_INVITES,
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
							name: 'Test Two',
						},
					},
				],
			},
		},
	};

	beforeEach( () => {
		ListInvitesStore = require( 'lib/invites/stores/invites-list' );
	} );

	describe( 'Listing invites', () => {
		beforeEach( () => {
			Dispatcher.handleServerAction( actions.receiveInvites );
		} );

		test( 'List of invites should be an object', () => {
			const invites = ListInvitesStore.getInvites( siteId );
			assert.isObject( invites );
		} );

		test( 'Fetching more invites should add to the object', () => {
			const invites = ListInvitesStore.getInvites( siteId );
			let invitesAgain = [];
			assert.equal( 1, invites.size );
			Dispatcher.handleServerAction( actions.receiveMoreInvites );
			invitesAgain = ListInvitesStore.getInvites( siteId );
			assert.equal( 2, invitesAgain.size );
		} );
	} );
} );
