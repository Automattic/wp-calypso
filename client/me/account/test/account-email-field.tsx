/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import allDomainsReducer from 'calypso/state/all-domains/reducer';
import userSettingsReducer from 'calypso/state/user-settings/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AccountEmailField from '../account-email-field';

const OWNED_DOMAIN = 'my-owned-domain.com';

const buildInitialState = () => ( {
	currentUser: {
		id: 1,
		user: { ID: 1, email: 'user@gmail.com', email_verified: true },
	},
	allDomains: {
		domains: [
			{
				domain: OWNED_DOMAIN,
				isWPCOMDomain: false,
				isWpcomStagingDomain: false,
			},
			{
				domain: 'user.wordpress.com',
				isWPCOMDomain: true,
				isWpcomStagingDomain: false,
			},
		],
		requesting: false,
	},
	userSettings: {
		settings: { user_email: 'user@gmail.com', new_user_email: '' },
		unsavedSettings: {},
		updating: {},
		failed: {},
	},
} );

const renderFieldWithEmail = ( email: string ) =>
	renderWithProvider(
		<AccountEmailField
			userSettings={ { user_email: 'user@gmail.com' } }
			unsavedUserSettings={ { user_email: email } }
		/>,
		{
			initialState: buildInitialState(),
			reducers: { userSettings: userSettingsReducer, allDomains: allDomainsReducer },
		}
	);

const WARNING_MATCHER = /custom domain on your account/i;

describe( 'AccountEmailField — owned-domain warning', () => {
	beforeAll( () => {
		// QueryAllDomains fires a network request on mount; stub it out.
		nock.disableNetConnect();
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( /\/rest\/v1\.1\/me\/all-domains/ )
			.reply( 200, { domains: [] } );
	} );

	afterAll( () => {
		nock.cleanAll();
		nock.enableNetConnect();
	} );

	it( 'does not show the warning when the email uses an unrelated domain', () => {
		renderFieldWithEmail( 'user@external-provider.com' );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'shows the warning when the email uses a domain registered to the account', () => {
		renderFieldWithEmail( `me@${ OWNED_DOMAIN }` );
		expect( screen.getByText( WARNING_MATCHER ) ).toBeVisible();
	} );

	it( 'matches the owned domain case-insensitively', () => {
		renderFieldWithEmail( `me@${ OWNED_DOMAIN.toUpperCase() }` );
		expect( screen.getByText( WARNING_MATCHER ) ).toBeVisible();
	} );

	it( 'does not show the warning for WPCOM subdomains', () => {
		renderFieldWithEmail( 'me@user.wordpress.com' );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );
} );
