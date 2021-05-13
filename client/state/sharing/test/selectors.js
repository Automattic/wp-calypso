/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getAvailableExternalAccounts } from '../selectors';

describe( 'selectors', () => {
	const state = {
		currentUser: {
			id: 26957695,
		},
		sharing: {
			keyring: {
				items: {
					1: {
						ID: 1,
						external_ID: '23455664',
						service: 'twitter',
						sites: [ '2916284' ],
						additional_external_users: [],
					},
					2: {
						ID: 2,
						external_ID: '6675433',
						service: 'instagram',
						sites: [ '77203074' ],
						keyring_connection_user_ID: 1,
						additional_external_users: [],
					},
					3: {
						ID: 3,
						external_ID: '35332233',
						service: 'facebook',
						sites: [ '2916284', '77203074' ],
						shared: true,
						additional_external_users: [],
					},
					4: {
						ID: 4,
						external_ID: '99009233',
						service: 'facebook',
						sites: [ '77203074' ],
						shared: false,
						additional_external_users: [
							{
								external_ID: '1222',
								external_name: 'John',
								external_profile_picture: undefined,
							},
						],
					},
				},
				isFetching: true,
			},
			publicize: {
				connectionsBySiteId: {
					2916284: [ 1, 2, 3 ],
				},
				connections: {
					1: { ID: 1, site_ID: 2916284, shared: true },
					2: { ID: 2, site_ID: 2916284, keyring_connection_user_ID: 26957695 },
				},
			},
			services: {
				items: {
					facebook: {
						ID: 'facebook',
						label: 'Facebook',
						type: 'publicize',
						multiple_external_user_ID_support: true,
						external_users_only: true,
						jetpack_support: true,
						jetpack_module_required: 'publicize',
					},
					twitter: {
						ID: 'twitter',
						label: 'Twitter',
						type: 'publicize',
						multiple_external_user_ID_support: false,
						external_users_only: false,
						jetpack_support: true,
						jetpack_module_required: 'publicize',
					},
					isFetching: false,
				},
			},
		},

		ui: {
			selectedSiteId: 2916284,
		},
	};

	describe( 'getAvailableExternalAccounts()', () => {
		test( 'should return an empty array for a site which has not yet been fetched', () => {
			const connections = getAvailableExternalAccounts( state, 'path' );

			expect( connections ).to.eql( [] );
		} );

		test( 'should return an array of available accounts', () => {
			const connections = getAvailableExternalAccounts( state, 'twitter' );

			expect( connections ).to.eql( [
				{
					ID: '23455664',
					isConnected: false,
					isExternal: false,
					keyringConnectionId: 1,
					name: undefined,
					picture: undefined,
				},
			] );
		} );

		test( 'should return an array of available accounts including external users', () => {
			const connections = getAvailableExternalAccounts( state, 'facebook' );

			expect( connections ).to.eql( [
				{
					ID: '1222',
					isConnected: false,
					isExternal: true,
					keyringConnectionId: 4,
					name: 'John',
					picture: undefined,
					description: undefined,
					meta: undefined,
				},
			] );
		} );
	} );
} );
