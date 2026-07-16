/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import accountRecoveryReducer from 'calypso/state/account-recovery/reducer';
import userSettingsReducer from 'calypso/state/user-settings/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AccountEmailField from '../account-email-field';

jest.mock( 'calypso/components/data/query-account-recovery-settings', () => () => null );

type RecoveryState = {
	isReady?: boolean;
	recoveryEmail?: string;
	recoveryPhone?: object | null;
};

const buildInitialState = ( {
	isReady = true,
	recoveryEmail = '',
	recoveryPhone = null,
}: RecoveryState = {} ) => ( {
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
	accountRecovery: {
		isFetchingSettings: false,
		settings: {
			data: {
				email: recoveryEmail,
				emailValidated: false,
				phone: recoveryPhone,
				phoneValidated: false,
			},
			isReady,
			isUpdating: {},
			isDeleting: {},
			isValidatingPhone: false,
			hasSentValidation: {},
		},
	},
} );

const renderFieldWithEmail = ( email: string, recoveryState: RecoveryState = {} ) =>
	renderWithProvider(
		<AccountEmailField
			userSettings={ { user_email: 'user@gmail.com' } }
			unsavedUserSettings={ { user_email: email } }
		/>,
		{
			initialState: buildInitialState( recoveryState ),
			reducers: { userSettings: userSettingsReducer, accountRecovery: accountRecoveryReducer },
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

	it( 'shows the warning for a custom domain when no recovery method is set', () => {
		renderFieldWithEmail( 'me@my-custom-domain.com' );
		expect( screen.getByText( WARNING_MATCHER ) ).toBeVisible();
	} );

	it( 'shows the warning for a custom domain case-insensitively', () => {
		renderFieldWithEmail( 'me@MY-CUSTOM-DOMAIN.COM' );
		expect( screen.getByText( WARNING_MATCHER ) ).toBeVisible();
	} );

	it( 'links to the account recovery settings page', () => {
		renderFieldWithEmail( 'me@my-custom-domain.com' );
		expect(
			screen.getByRole( 'link', { name: /set up a recovery email or phone number/i } )
		).toHaveAttribute( 'href', '/me/security/account-recovery' );
	} );

	it( 'does not show the warning when a recovery email is already set', () => {
		renderFieldWithEmail( 'me@my-custom-domain.com', { recoveryEmail: 'backup@gmail.com' } );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'does not show the warning when a recovery phone is already set', () => {
		renderFieldWithEmail( 'me@my-custom-domain.com', {
			recoveryPhone: { countryCode: 'US', number: '5551234' },
		} );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'does not show the warning before account recovery settings are ready', () => {
		renderFieldWithEmail( 'me@my-custom-domain.com', { isReady: false } );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
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
