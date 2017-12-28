/** @format */

/**
 * Internal dependencies
 */
import { getHappychatAuth } from '../utils';
import config from 'config';
import * as wpcom from 'client/lib/wp';
import * as selectedSite from 'client/state/help/selectors';

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
				name: 'jetpackConnect',
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
			getHappychatAuth( state )().then( user => {
				expect( user ).toMatchObject( {
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
			getHappychatAuth( state )().catch( error => {
				expect( error ).toBe(
					'Failed to start an authenticated Happychat session: failed request'
				);
			} );
		} );
	} );
} );
