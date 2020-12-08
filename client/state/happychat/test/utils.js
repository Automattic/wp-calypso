/**
 * Internal dependencies
 */
import { getHappychatAuth } from '../utils';
import config from 'calypso/config';
import * as wpcom from 'calypso/lib/wp';
import * as selectedSite from 'calypso/state/help/selectors';

describe( 'auth promise', () => {
	const state = {
		currentUser: {
			id: 3,
		},
		users: {
			items: {
				3: { ID: 123456, localeSlug: 'gl' },
			},
		},
		ui: {
			section: {
				name: 'jetpack-connect',
			},
		},
	};

	describe( 'upon request success', () => {
		beforeEach( () => {
			wpcom.default.request = jest.fn();
			wpcom.default.request.mockImplementation( ( args, callback ) =>
				callback( null, {
					jwt: 'jwt',
					geo_location: {
						city: 'Lugo',
					},
				} )
			);

			// mock getHelpSelectedSite to return null
			selectedSite.getHelpSelectedSite = jest.fn();
			selectedSite.getHelpSelectedSite.mockReturnValue( null );
		} );

		test( 'should return a fulfilled Promise', () => {
			return expect( getHappychatAuth( state )() ).resolves.toMatchObject( {
				url: config( 'happychat_url' ),
				user: {
					signer_user_id: state.users.items[ 3 ].ID,
					locale: state.users.items[ 3 ].localeSlug,
					groups: [ 'jpop' ],
					jwt: 'jwt',
					geoLocation: { city: 'Lugo' },
				},
			} );
		} );
	} );

	describe( 'upon request failure', () => {
		beforeEach( () => {
			wpcom.default.request = jest.fn();
			wpcom.default.request.mockImplementation( ( args, callback ) =>
				callback( 'failed request', {} )
			);

			// mock getHelpSelectedSite to return null
			selectedSite.getHelpSelectedSite = jest.fn();
			selectedSite.getHelpSelectedSite.mockReturnValue( null );
		} );

		test( 'should return a rejected Promise', () => {
			return expect( getHappychatAuth( state )() ).rejects.toMatch(
				'Failed to start an authenticated Happychat session: failed request'
			);
		} );
	} );

	test( 'should return a rejected promise if there is no current user', () => {
		const noUserState = {
			currentUser: {},
			users: {},
			ui: {
				section: {
					name: 'jetpack-connect',
				},
			},
		};
		return expect( getHappychatAuth( noUserState )() ).rejects.toMatch(
			'Failed to start an authenticated Happychat session: No current user found'
		);
	} );
} );
