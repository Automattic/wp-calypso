/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getRemovableConnections from 'calypso/state/selectors/get-removable-connections';

describe( 'getRemovableConnections()', () => {
	const state = {
		currentUser: {
			id: 26957695,
			capabilities: {
				2916284: {
					edit_others_posts: true,
				},
			},
		},
		sharing: {
			keyring: {
				items: {
					1: { ID: 1, type: 'publicize', shared: true, service: 'twitter', user_ID: 0 },
					2: { ID: 2, type: 'publicize', service: 'twitter', user_ID: 26957695 },
					3: { ID: 3, type: 'publicize', service: 'facebook' },
					4: { ID: 4, type: 'other', service: 'instagram-basic-display', user_ID: 26957695 },
					5: { ID: 5, type: 'other', service: 'instagram-basic-display', user_ID: 0 },
				},
			},
			publicize: {
				connections: {
					1: { ID: 1, site_ID: 2916284, shared: true, service: 'twitter', user_ID: 0 },
					2: {
						ID: 2,
						site_ID: 2916284,
						keyring_connection_user_ID: 26957695,
						service: 'twitter',
						user_ID: 26957695,
					},
					3: { ID: 2, site_ID: 2916284, keyring_connection_user_ID: 18342963, service: 'facebook' },
				},
			},
		},
		ui: {
			selectedSiteId: 2916284,
		},
	};

	test( 'should return an empty array for a service without connections', () => {
		const connections = getRemovableConnections( state, 'path' );

		expect( connections ).to.eql( [] );
	} );

	test( 'should return an array of connection objects that are removable by the current user without duplicates', () => {
		const twitterConnections = getRemovableConnections( state, 'twitter' );

		expect( twitterConnections ).to.eql( [
			{ ID: 1, site_ID: 2916284, shared: true, service: 'twitter', user_ID: 0 },
			{
				ID: 2,
				site_ID: 2916284,
				keyring_connection_user_ID: 26957695,
				service: 'twitter',
				user_ID: 26957695,
			},
		] );

		const instagramConnections = getRemovableConnections( state, 'instagram-basic-display' );

		expect( instagramConnections ).to.eql( [
			{ ID: 4, type: 'other', service: 'instagram-basic-display', user_ID: 26957695 },
		] );
	} );
} );
