/**
 * @jest-environment jsdom
 */

import { ACCOUNT_EMAIL_RECOVERY_SNOOZE } from '@automattic/api-core';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useState } from 'react';
import { render } from '../../../test-utils';
import EmailSection from '../email-section';
import type { AccountRecovery, User, UserSettings } from '@automattic/api-core';

const ACCOUNT_EMAIL = 'owner@mycompany.com';

function mockAccountRecovery( data: Partial< AccountRecovery > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/account-recovery' )
		.query( true )
		.reply( 200, {
			email: '',
			email_validated: false,
			phone: null,
			phone_validated: false,
			...data,
		} );
}

function mockPreferences( until = 0 ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: { [ ACCOUNT_EMAIL_RECOVERY_SNOOZE ]: until } } );
}

const userSettings = { user_email: ACCOUNT_EMAIL } as UserSettings;
const bouncingUser = { ID: 1, email: ACCOUNT_EMAIL, email_bouncing: true } as User;
const noop = () => {};

const RECOVERY_WARNING = /Protect access to your account/;

function EditableEmailSection( { initialValue }: { initialValue: string } ) {
	const [ value, setValue ] = useState( initialValue );
	return (
		<EmailSection
			value={ value }
			onChange={ setValue }
			userSettings={ userSettings }
			isEmailVerified
		/>
	);
}
const BOUNCING_ERROR = /bouncing back/;

describe( '<EmailSection>', () => {
	test( 'warns when the only verified recovery email matches the account email', async () => {
		mockPreferences();
		// The recovery email is the same address as the account email, so it provides no recovery
		// value and the "set up a recovery email" warning should still appear.
		mockAccountRecovery( { email: ACCOUNT_EMAIL, email_validated: true } );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>
		);

		expect( await screen.findByText( RECOVERY_WARNING ) ).toBeVisible();
	} );

	test( 'hides the warning for a distinct verified recovery email', async () => {
		mockPreferences();
		const request = mockAccountRecovery( {
			email: 'recovery@othersite.com',
			email_validated: true,
		} );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>
		);

		await waitFor( () => expect( request.isDone() ).toBe( true ) );
		expect( screen.queryByText( RECOVERY_WARNING ) ).not.toBeInTheDocument();
	} );

	test( 'flags the field when the account email is bouncing', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>,
			{ user: bouncingUser }
		);

		expect( await screen.findByText( BOUNCING_ERROR ) ).toBeVisible();
		expect( screen.getByRole( 'textbox', { name: /email address/i } ) ).not.toHaveFocus();
	} );

	test( 'flags the field when the value returns to a bouncing account email', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		function ResettableEmailSection() {
			const [ value, setValue ] = useState( 'new@example.com' );
			return (
				<>
					<EmailSection
						value={ value }
						onChange={ setValue }
						userSettings={ userSettings }
						isEmailVerified
					/>
					<button onClick={ () => setValue( ACCOUNT_EMAIL ) }>Reset</button>
				</>
			);
		}

		render( <ResettableEmailSection />, { user: bouncingUser } );
		expect( screen.queryByText( BOUNCING_ERROR ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Reset' } ) );

		expect( await screen.findByText( BOUNCING_ERROR ) ).toBeVisible();
		expect( screen.getByRole( 'textbox', { name: /email address/i } ) ).not.toHaveFocus();
	} );

	test( 'drops the bouncing message once a different address is typed', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value="new@example.com"
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>,
			{ user: bouncingUser }
		);

		await userEvent.click( screen.getByRole( 'textbox', { name: /email address/i } ) );
		await userEvent.tab();

		expect( await screen.findByText( 'Email address looks good!' ) ).toBeVisible();
		expect( screen.queryByText( BOUNCING_ERROR ) ).not.toBeInTheDocument();
	} );

	test( 'hides the bouncing message when the account email is fine', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );

		render(
			<EmailSection
				value={ ACCOUNT_EMAIL }
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
			/>
		);

		await waitFor( () => {
			expect( screen.queryByText( BOUNCING_ERROR ) ).not.toBeInTheDocument();
		} );
	} );
} );

describe( '<EmailSection> TLD validation', () => {
	test( 'reports the field invalid and names the domain when the TLD is not real', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );
		const onValidationChange = jest.fn();

		render(
			<EmailSection
				value="user@gmail.commmm"
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
				onValidationChange={ onValidationChange }
			/>
		);

		await userEvent.click( screen.getByRole( 'textbox', { name: /email address/i } ) );
		await userEvent.tab();

		expect( await screen.findByText( /gmail\.commmm/ ) ).toBeVisible();
		expect( screen.getByText( /real domain/i ) ).toBeVisible();
		expect( onValidationChange ).toHaveBeenLastCalledWith( false );
	} );

	test( 'drops the custom-domain warning once the TLD stops being real', async () => {
		mockAccountRecovery( { email: '', phone: null } );

		render( <EditableEmailSection initialValue="user@mycompany.com" /> );
		expect( await screen.findByText( RECOVERY_WARNING ) ).toBeVisible();

		await userEvent.type( screen.getByRole( 'textbox', { name: /email address/i } ), 'mmm' );
		await userEvent.tab();

		expect( await screen.findByText( /real domain/i ) ).toBeVisible();
		expect( screen.queryByText( RECOVERY_WARNING ) ).not.toBeInTheDocument();
	} );

	test( 'reports the field valid for a known TLD', async () => {
		mockAccountRecovery( { email: 'recovery@othersite.com', email_validated: true } );
		const onValidationChange = jest.fn();

		render(
			<EmailSection
				value="user@example.zip"
				onChange={ noop }
				userSettings={ userSettings }
				isEmailVerified
				onValidationChange={ onValidationChange }
			/>
		);

		await userEvent.click( screen.getByRole( 'textbox', { name: /email address/i } ) );
		await userEvent.tab();

		expect( await screen.findByText( /looks good/i ) ).toBeVisible();
		expect( onValidationChange ).toHaveBeenLastCalledWith( true );
	} );
} );

describe( 'Account email recovery reminder', () => {
	test( 'can retry a failed dismissal without submitting or hiding the warning', async () => {
		const user = userEvent.setup();
		mockPreferences();
		mockAccountRecovery( { email: 'backup@gmail.com' } );
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 500 );
		const save = nock( 'https://public-api.wordpress.com' )
			.post(
				'/rest/v1.1/me/preferences',
				( body ) => body.calypso_preferences?.[ ACCOUNT_EMAIL_RECOVERY_SNOOZE ] > Date.now() / 1000
			)
			.query( true )
			.reply( 200, ( _uri, body ) => body );
		const onSubmit = jest.fn();

		render(
			<form onSubmit={ onSubmit }>
				<EmailSection
					value={ ACCOUNT_EMAIL }
					onChange={ noop }
					userSettings={ userSettings }
					isEmailVerified
				/>
			</form>
		);

		const remind = await screen.findByRole( 'button', { name: /remind me in six months/i } );
		await user.click( remind );
		expect( await screen.findByText( /could not dismiss/i ) ).toBeVisible();
		expect( screen.getByText( RECOVERY_WARNING ) ).toBeVisible();
		expect( onSubmit ).not.toHaveBeenCalled();
		await user.click( remind );
		await waitFor( () => expect( screen.queryByText( RECOVERY_WARNING ) ).toBeNull() );
		expect( save.isDone() ).toBe( true );
	} );

	test( 'honors the saved dismissal and keeps the draft and recovery link usable', async () => {
		const user = userEvent.setup();
		const snooze = Math.floor( Date.now() / 1000 ) + 3600;
		mockPreferences( snooze );
		mockAccountRecovery( {} );

		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData( [ 'me', 'account-email-recovery-snooze', 1 ], 0 );
		render( <EditableEmailSection initialValue={ ACCOUNT_EMAIL } />, { queryClient } );
		expect( screen.queryByText( RECOVERY_WARNING ) ).toBeNull();

		await waitFor( () => {
			expect( queryClient.getQueryData( [ 'me', 'account-email-recovery-snooze', 1 ] ) ).toBe(
				snooze
			);
		} );
		expect( screen.queryByText( RECOVERY_WARNING ) ).toBeNull();

		const input = screen.getByRole( 'textbox', { name: /email address/i } );
		await user.clear( input );
		await user.type( input, 'student@college.edu' );
		expect( await screen.findByRole( 'link', { name: /opens in a new tab/i } ) ).toHaveAttribute(
			'target',
			'_blank'
		);
		expect( input ).toHaveValue( 'student@college.edu' );
		await user.tab();
		expect( screen.queryByText( 'Email address looks good!' ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: /remind me/i } ) ).toBeNull();
	} );
} );
