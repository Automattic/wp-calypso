/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getAvailableExternalAccounts,
} from '../selectors';

describe( 'selectors', () => {
	const state = {
		currentUser: {
			id: 26957695,
		},
		sharing: {
			keyring: {
				items: {
					1: { ID: 1, service: 'twitter', sites: [ '2916284' ], additional_external_users: [] },
					2: { ID: 2, service: 'instagram', sites: [ '77203074' ], keyring_connection_user_ID: 1, additional_external_users: [] },
					3: { ID: 3, service: 'facebook', sites: [ '2916284', '77203074' ], shared: true, additional_external_users: [] },
					4: { ID: 4, service: 'facebook', sites: [ '77203074' ], shared: false, additional_external_users: [ {
						external_ID: 1,
						external_name: 'John',
						external_profile_picture: undefined,
					} ] },
				},
				isFetching: true,
			},
			publicize: {
				connectionsBySiteId: {
					2916284: [ 1, 2, 3 ]
				},
				connections: {
					1: { ID: 1, site_ID: 2916284, shared: true },
					2: { ID: 2, site_ID: 2916284, keyring_connection_user_ID: 26957695 },
				}
			}
		},
		ui: {
			selectedSiteId: 2916284,
		},
	};

	describe( 'getAvailableExternalAccounts()', () => {
		it( 'should return an empty array for a site which has not yet been fetched', () => {
			const connections = getAvailableExternalAccounts( state, 'path' );

			expect( connections ).to.eql( [] );
		} );

		it( 'should return an array of available accounts', () => {
			const connections = getAvailableExternalAccounts( state, 'twitter' );

			expect( connections ).to.eql( [
				{ isConnected: false, keyringConnectionId: 1, name: undefined, picture: undefined },
			] );
		} );

		it( 'should return an array of available accounts including external users', () => {
			const connections = getAvailableExternalAccounts( state, 'facebook' );

			expect( connections ).to.eql( [
				{ isConnected: false, keyringConnectionId: 3, name: undefined, picture: undefined },
				{ isConnected: false, keyringConnectionId: 4, name: undefined, picture: undefined },
				{ ID: 1, isConnected: false, isExternal: true, keyringConnectionId: 4, name: 'John', picture: undefined },
			] );
		} );
	} );
} );
