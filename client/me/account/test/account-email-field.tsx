/**
 * @jest-environment jsdom
 */
import { ACCOUNT_EMAIL_RECOVERY_SNOOZE } from '@automattic/api-core';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useSelector } from 'calypso/state';
import accountRecoveryReducer from 'calypso/state/account-recovery/reducer';
import { accountRecoverySettingsFetch } from 'calypso/state/account-recovery/settings/actions';
import getUnsavedUserSettings from 'calypso/state/selectors/get-unsaved-user-settings';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import userSettingsReducer from 'calypso/state/user-settings/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AccountEmailField from '../account-email-field';

jest.mock( 'calypso/state/account-recovery/settings/actions', () => ( {
	...jest.requireActual( 'calypso/state/account-recovery/settings/actions' ),
	accountRecoverySettingsFetch: jest.fn( () => ( { type: 'TEST_RECOVERY_FETCH' } ) ),
} ) );

type RecoveryState = {
	isReady?: boolean;
	recoveryEmail?: string;
	recoveryEmailVerified?: boolean;
	recoveryPhone?: object | null;
	recoveryPhoneVerified?: boolean;
};

const buildInitialState = ( {
	isReady = true,
	recoveryEmail = '',
	recoveryEmailVerified = false,
	recoveryPhone = null,
	recoveryPhoneVerified = false,
}: RecoveryState = {} ) => ( {
	currentUser: {
		id: 1,
		user: { ID: 1, email: 'user@gmail.com', email_verified: true },
	},
	userSettings: {
		settings: { user_email: 'user@gmail.com', new_user_email: '' },
		unsavedSettings: {},
		updating: false,
		failed: false,
	},
	accountRecovery: {
		isFetchingSettings: false,
		settings: {
			data: {
				email: recoveryEmail,
				emailValidated: recoveryEmailVerified,
				phone: recoveryPhone,
				phoneValidated: recoveryPhoneVerified,
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

const WARNING_MATCHER = /you could be locked out of your account/i;
const DRAFT_FALLBACK = /if you don’t have a verified recovery/i;
const REMINDER = /remind me in six months/i;

function mockPreferences( until = 0 ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: { [ ACCOUNT_EMAIL_RECOVERY_SNOOZE ]: until } } );
}

describe( 'Account email recovery warning', () => {
	it.each( [ 'user@gmail.com', 'user@OUTLOOK.FR', 'user@icloud.com', '', 'user@' ] )(
		'does not warn for %s',
		( email ) => {
			renderFieldWithEmail( email );
			expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
		}
	);

	it( 'warns about a risky draft with an unverified backup and keeps the draft open', () => {
		renderFieldWithEmail( 'student@college.edu', { recoveryEmail: 'backup@gmail.com' } );
		expect( screen.getByText( WARNING_MATCHER ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /set up account recovery/i } ) ).toHaveAttribute(
			'target',
			'_blank'
		);
		expect( screen.queryByRole( 'button', { name: REMINDER } ) ).toBeNull();
	} );

	it( 'suppresses the warning for a verified phone', () => {
		renderFieldWithEmail( 'student@college.edu', {
			recoveryPhone: { number: '5551234' },
			recoveryPhoneVerified: true,
		} );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
	} );

	it( 'warns conditionally when a risky draft is entered before recovery settings load', () => {
		renderFieldWithEmail( 'student@college.edu', { isReady: false } );
		expect( screen.getByText( DRAFT_FALLBACK ) ).toBeVisible();
	} );

	function renderSavedField( props = {} ) {
		return renderWithProvider(
			<AccountEmailField userSettings={ { user_email: 'student@college.edu' } } { ...props } />,
			{
				initialState: buildInitialState(),
				reducers: { userSettings: userSettingsReducer, accountRecovery: accountRecoveryReducer },
			}
		);
	}

	it( 'keeps focus for a keyboard retry when dismissal fails', async () => {
		const user = userEvent.setup();
		mockPreferences();
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.query( true )
			.delay( 100 )
			.reply( 500 );
		const save = nock( 'https://public-api.wordpress.com' )
			.post(
				'/rest/v1.1/me/preferences',
				( body ) => body.calypso_preferences?.[ ACCOUNT_EMAIL_RECOVERY_SNOOZE ] > Date.now() / 1000
			)
			.query( true )
			.reply( 200, ( _uri, body ) => body );

		renderSavedField();

		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();
		const remind = await screen.findByRole( 'button', { name: REMINDER } );
		await user.click( remind );
		expect( remind ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( await screen.findByText( /could not dismiss/i ) ).toBeVisible();
		expect( remind ).toHaveFocus();
		await user.keyboard( '{Enter}' );
		await waitFor( () => expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull() );
		expect( save.isDone() ).toBe( true );
	} );

	it( 'clears the saved warning after recovery is verified in another window', async () => {
		const { accountRecoverySettingsFetch: realFetch } = jest.requireActual(
			'calypso/state/account-recovery/settings/actions'
		);
		jest.mocked( accountRecoverySettingsFetch ).mockImplementationOnce( realFetch );
		mockPreferences();
		const recoveryResponse = ( emailValidated: boolean ) => ( {
			email: 'backup@gmail.com',
			email_validated: emailValidated,
			phone: null,
			phone_validated: false,
		} );
		const initialRecovery = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/account-recovery' )
			.query( true )
			.reply( 200, recoveryResponse( false ) );
		renderSavedField( { hasUnsavedChanges: true } );

		expect( await screen.findByRole( 'link', { name: /opens in a new tab/i } ) ).toHaveAttribute(
			'target',
			'_blank'
		);
		await waitFor( () => expect( initialRecovery.isDone() ).toBe( true ) );
		jest.mocked( accountRecoverySettingsFetch ).mockImplementationOnce( realFetch );
		const verifiedRecovery = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/account-recovery' )
			.query( true )
			.reply( 200, recoveryResponse( true ) );
		act( () => window.dispatchEvent( new Event( 'focus' ) ) );
		await waitFor( () => expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull() );
		expect( verifiedRecovery.isDone() ).toBe( true );
	} );

	it( 'refreshes the active email when a pending change was confirmed in another tab', async () => {
		const savedEmail = 'student@college.edu';
		const pendingEmail = 'student@gmail.com';
		const initialState = buildInitialState();
		initialState.userSettings = {
			...initialState.userSettings,
			settings: { user_email: savedEmail, new_user_email: pendingEmail },
			updating: false,
		};
		mockPreferences();
		const settings = nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/settings' )
			.query( { fields: 'user_email,new_user_email,user_email_change_pending' } )
			.reply( 200, {
				user_email: pendingEmail,
				new_user_email: '',
				user_email_change_pending: false,
			} );
		function ConnectedEmailField() {
			return <AccountEmailField userSettings={ useSelector( getUserSettings ) ?? undefined } />;
		}

		renderWithProvider( <ConnectedEmailField />, {
			initialState,
			reducers: { userSettings: userSettingsReducer, accountRecovery: accountRecoveryReducer },
		} );

		expect(
			await screen.findByText( /student@college.edu is still your sign-in email/ )
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: REMINDER } ) ).toBeNull();
		act( () => window.dispatchEvent( new Event( 'focus' ) ) );
		await waitFor( () =>
			expect( screen.getByRole( 'textbox', { name: /email address/i } ) ).toBeEnabled()
		);
		expect( settings.isDone() ).toBe( true );
		expect( screen.queryByRole( 'link', { name: /set up account recovery/i } ) ).toBeNull();
	} );

	it( 'honors a stored dismissal for the saved address while still warning on a new draft', async () => {
		const prefs = mockPreferences( Math.floor( Date.now() / 1000 ) + 3600 );
		const { rerender } = renderSavedField();

		await waitFor( () => expect( prefs.isDone() ).toBe( true ) );
		expect( screen.queryByText( WARNING_MATCHER ) ).toBeNull();

		rerender(
			<AccountEmailField
				userSettings={ { user_email: 'student@college.edu' } }
				unsavedUserSettings={ { user_email: 'staff@employer.com' } }
			/>
		);
		expect( screen.getByText( WARNING_MATCHER ) ).toBeVisible();
	} );
} );

describe( 'AccountEmailField TLD validation', () => {
	// Mirrors the parent screen, which hands the store's unsaved settings back down as props.
	function EditableAccountEmailField( {
		emailValidationHandler,
	}: {
		emailValidationHandler: ( isEmailValid: boolean ) => void;
	} ) {
		const unsavedUserSettings = useSelector( getUnsavedUserSettings ) ?? undefined;
		return (
			<AccountEmailField
				userSettings={ { user_email: 'user@gmail.com' } }
				unsavedUserSettings={ unsavedUserSettings }
				emailValidationHandler={ emailValidationHandler }
			/>
		);
	}

	const renderAndType = async ( email: string ) => {
		const emailValidationHandler = jest.fn();
		renderWithProvider(
			<EditableAccountEmailField emailValidationHandler={ emailValidationHandler } />,
			{
				initialState: buildInitialState(),
				reducers: { userSettings: userSettingsReducer, accountRecovery: accountRecoveryReducer },
			}
		);
		const input = screen.getByRole( 'textbox', { name: /email/i } );
		await userEvent.clear( input );
		await userEvent.type( input, email );
		return emailValidationHandler;
	};

	it( 'reports the field invalid and names the domain when the TLD is not real', async () => {
		const emailValidationHandler = await renderAndType( 'user@gmail.commmm' );

		expect( screen.getByText( /gmail\.commmm/ ) ).toBeVisible();
		expect( screen.getByText( /real domain/i ) ).toBeVisible();
		expect( emailValidationHandler ).toHaveBeenLastCalledWith( false );
	} );

	it( 'reports the field valid for a known TLD', async () => {
		const emailValidationHandler = await renderAndType( 'user@example.zip' );

		expect( screen.queryByText( /real domain/i ) ).toBeNull();
		expect( emailValidationHandler ).toHaveBeenLastCalledWith( true );
	} );
} );
