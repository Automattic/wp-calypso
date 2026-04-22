/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import userSettingsReducer from 'calypso/state/user-settings/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AccountEmailField from '../account-email-field';

const buildInitialState = () => ( {
	currentUser: {
		id: 1,
		user: { ID: 1, email: 'user@gmail.com', email_verified: true },
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
			reducers: { userSettings: userSettingsReducer },
		}
	);

const WARNING_MATCHER = /custom domain/i;

describe( 'AccountEmailField — custom domain warning', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	afterAll( () => {
		nock.cleanAll();
		nock.enableNetConnect();
	} );

	it( 'does not show the warning for a well-known free provider (gmail)', () => {
		renderFieldWithEmail( 'user@gmail.com' );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'does not show the warning for a well-known free provider (outlook)', () => {
		renderFieldWithEmail( 'user@outlook.com' );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'does not show the warning for a well-known free provider (icloud)', () => {
		renderFieldWithEmail( 'user@icloud.com' );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'shows the warning for a custom domain', () => {
		renderFieldWithEmail( 'me@my-custom-domain.com' );
		expect( screen.getByText( WARNING_MATCHER ) ).toBeVisible();
	} );

	it( 'shows the warning for a custom domain case-insensitively', () => {
		renderFieldWithEmail( 'me@MY-CUSTOM-DOMAIN.COM' );
		expect( screen.getByText( WARNING_MATCHER ) ).toBeVisible();
	} );

	it( 'does not show the warning for an empty email', () => {
		renderFieldWithEmail( '' );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'does not show the warning for an email without an @ symbol', () => {
		renderFieldWithEmail( 'invalidemail' );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'does not show the warning for an email ending with @', () => {
		renderFieldWithEmail( 'user@' );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );
} );
