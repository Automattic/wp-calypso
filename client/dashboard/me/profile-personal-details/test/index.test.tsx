/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PersonalDetailsSection from '../index';
import type { User, UserSettings } from '@automattic/api-core';

const settings = {
	first_name: 'John',
	last_name: 'Doe',
	display_name: 'John Doe',
	user_URL: 'https://example.com',
	description: 'Hello world',
	avatar_URL: 'https://gravatar.com/avatar/test',
	user_login: 'johndoe',
	user_email: 'john@example.com',
	email_verified: true,
	user_login_can_be_changed: true,
} as unknown as UserSettings;

const unverifiedUser = {
	ID: 1,
	username: 'johndoe',
	email: 'john@example.com',
	email_verified: false,
	language: 'en',
} as User;

function mockUserSettings( data: UserSettings ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.reply( 200, data );
}

function mockValidateUsername( username: string ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/me/username/validate/${ username }` )
		.reply( 200, { success: true, allowed_actions: { none: 'Keep your current URL' } } );
}

function mockIsAutomattician( isAutomattician: boolean ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/read/teams' )
		.reply( 200, {
			number: isAutomattician ? 1 : 0,
			teams: isAutomattician ? [ { slug: 'a8c', title: 'Automatticians' } ] : [],
		} );
}

function mockAccountRecovery( {
	email = '',
	phone = null,
}: { email?: string; phone?: object | null } = {} ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/account-recovery' )
		.reply( 200, {
			email,
			email_validated: false,
			phone,
			phone_validated: false,
		} );
}

describe( '<PersonalDetailsSection>', () => {
	test( 'renders the form and saves the form', async () => {
		const user = userEvent.setup();
		mockUserSettings( settings );
		mockIsAutomattician( false );

		render( <PersonalDetailsSection /> );
		await screen.findByRole( 'textbox', { name: 'Email address' }, { timeout: 2000 } );

		expect( screen.getByRole( 'textbox', { name: 'First name' } ) ).toHaveValue( 'John' );
		expect( screen.getByRole( 'textbox', { name: 'Last name' } ) ).toHaveValue( 'Doe' );
		expect( screen.getByRole( 'textbox', { name: 'Username' } ) ).toHaveValue( 'johndoe' );
		expect( screen.getByRole( 'textbox', { name: 'Email address' } ) ).toHaveValue(
			'john@example.com'
		);
		expect( screen.getByRole( 'textbox', { name: 'Display name' } ) ).toHaveValue( 'John Doe' );
		expect( screen.getByRole( 'textbox', { name: 'Web address' } ) ).toHaveValue(
			'https://example.com'
		);
		expect( screen.getByRole( 'textbox', { name: 'About me' } ) ).toHaveValue( 'Hello world' );
		const firstNameInput = screen.getByRole( 'textbox', { name: 'First name' } );
		await user.clear( firstNameInput );
		await user.type( firstNameInput, 'Jane' );

		const lastNameInput = screen.getByRole( 'textbox', { name: 'Last name' } );
		await user.clear( lastNameInput );
		await user.type( lastNameInput, 'Smith' );

		const emailInput = screen.getByRole( 'textbox', { name: 'Email address' } );
		await user.clear( emailInput );
		await user.type( emailInput, 'jane@example.com' );

		const displayNameInput = screen.getByRole( 'textbox', { name: 'Display name' } );
		await user.clear( displayNameInput );
		await user.type( displayNameInput, 'Jane Smith' );

		const descriptionInput = screen.getByRole( 'textbox', { name: 'About me' } );
		await user.clear( descriptionInput );
		await user.type( descriptionInput, 'Updated bio' );

		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => {
				expect( body ).toEqual(
					expect.objectContaining( {
						first_name: 'Jane',
						last_name: 'Smith',
						user_email: 'jane@example.com',
						display_name: 'Jane Smith',
						description: 'Updated bio',
					} )
				);
				return true;
			} )
			.reply( 200, {
				...settings,
				first_name: 'Jane',
				last_name: 'Smith',
				user_email: 'jane@example.com',
				display_name: 'Jane Smith',
				description: 'Updated bio',
			} );

		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'explains what each field is for', async () => {
		mockUserSettings( settings );
		mockIsAutomattician( false );

		render( <PersonalDetailsSection /> );
		await screen.findByRole( 'textbox', { name: 'Email address' }, { timeout: 2000 } );

		expect( screen.getByText( 'Avatar' ) ).toBeVisible();
		expect( screen.getAllByRole( 'button', { name: 'Change avatar' } )[ 0 ] ).toBeVisible();
		expect(
			screen.getByText( 'For invoices and domain contacts. Not shown on your posts or comments.' )
		).toBeVisible();
		expect( screen.getByText( 'Sign-in and @mentions. Changes can’t be undone.' ) ).toBeVisible();
		expect( screen.getByText( 'The name shown on your posts and comments.' ) ).toBeVisible();
		expect( screen.getByText( 'Sign-in and account emails. Not shown publicly.' ) ).toBeVisible();
		expect( screen.getByText( 'A short bio shown on your public profile.' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Your name links here when you comment. Only on WordPress.com, not on your Gravatar profile.'
			)
		).toBeVisible();
	} );

	describe( 'username field', () => {
		test( 'disables username field for Automatticians', async () => {
			mockUserSettings( settings );
			mockIsAutomattician( true );

			render( <PersonalDetailsSection /> );

			await waitFor( () => {
				expect( screen.getByRole( 'textbox', { name: 'Username' } ) ).toBeDisabled();
			} );
			expect( screen.getByText( 'Automatticians cannot change their username.' ) ).toBeVisible();
		} );

		test( 'disables username field for unverified email users', async () => {
			mockUserSettings( settings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection />, { user: unverifiedUser } );

			await waitFor( () => {
				expect( screen.getByRole( 'textbox', { name: 'Username' } ) ).toBeDisabled();
			} );
			expect(
				screen.getByText( 'Username can be changed once your email address is verified.' )
			).toBeVisible();
		} );

		test( 'shows username update form and submits username change', async () => {
			const user = userEvent.setup();
			mockUserSettings( settings );
			mockIsAutomattician( false );
			mockValidateUsername( 'newusername' );

			render( <PersonalDetailsSection /> );

			await waitFor( () => {
				expect( screen.getByRole( 'textbox', { name: 'Username' } ) ).toHaveValue( 'johndoe' );
			} );

			const usernameInput = screen.getByRole( 'textbox', { name: 'Username' } );
			await user.clear( usernameInput );
			await user.type( usernameInput, 'newusername' );

			const confirmInput = await screen.findByRole( 'textbox', { name: 'Confirm new username' } );
			await user.type( confirmInput, 'newusername' );

			// Wait for debounced validation to complete
			await waitFor(
				() => {
					expect( screen.getByRole( 'button', { name: 'Change username' } ) ).toBeEnabled();
				},
				{ timeout: 2000 }
			);

			const scope = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/username', ( body ) => {
					expect( body ).toEqual( { username: 'newusername', action: 'none' } );
					return true;
				} )
				.reply( 200, { success: true } );

			await user.click( screen.getByRole( 'button', { name: 'Change username' } ) );

			// Confirm in the modal
			await user.click( await screen.findByRole( 'button', { name: 'OK' } ) );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );
	} );

	describe( 'email field', () => {
		test( 'disables email input when email change is pending', async () => {
			mockUserSettings( {
				...settings,
				user_email_change_pending: true,
				new_user_email: 'pending@example.com',
			} as unknown as UserSettings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );

			await waitFor( () => {
				expect( screen.getByRole( 'textbox', { name: 'Email address' } ) ).toBeDisabled();
			} );
			expect( screen.getByText( 'Your email has not been verified yet.' ) ).toBeVisible();
		} );

		test( 'shows the unverified notice when the account email is not verified', async () => {
			mockUserSettings( settings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection />, { user: unverifiedUser } );

			await screen.findByRole( 'textbox', { name: 'Email address' } );

			expect( screen.getByText( 'Your email has not been verified yet.' ) ).toBeVisible();
			expect( screen.getByText( 'Verify your email' ) ).toBeVisible();
		} );

		test( 'cancels pending email change', async () => {
			const user = userEvent.setup();
			mockUserSettings( {
				...settings,
				user_email_change_pending: true,
				new_user_email: 'pending@example.com',
			} as unknown as UserSettings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );

			const scope = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/settings', ( body ) => {
					expect( body ).toEqual( expect.objectContaining( { user_email_change_pending: false } ) );
					return true;
				} )
				.reply( 200, {
					...settings,
					user_email_change_pending: false,
				} );

			const cancelButton = await screen.findByRole( 'button', {
				name: 'Cancel the pending email change.',
			} );
			await user.click( cancelButton );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
		} );

		test( 'holds back the email field cancellation while the banner is resending', async () => {
			const user = userEvent.setup();
			const pending = {
				...settings,
				user_email_change_pending: true,
				new_user_email: 'pending@example.com',
			} as unknown as UserSettings;
			mockUserSettings( pending );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );

			// Held open so the resend is still running while the cancellation is checked.
			let deliverResend: () => void;
			nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/settings', ( body ) => 'user_email' in body )
				.reply(
					() =>
						new Promise( ( resolve ) => {
							deliverResend = () => resolve( [ 200, pending ] );
						} )
				);

			await user.click( await screen.findByRole( 'button', { name: 'Resend email' } ) );

			// The banner and the email field each offer a cancellation and neither can see the
			// other's state, so a resend re-saving the pending address has to lock both.
			const cancelLink = screen.getByRole( 'button', {
				name: 'Cancel the pending email change.',
			} );
			expect( cancelLink ).toBeDisabled();
			deliverResend!();

			await waitFor( () => expect( cancelLink ).toBeEnabled() );
		} );

		test( 'warns when the account email uses a custom domain and no recovery method is set', async () => {
			mockUserSettings( {
				...settings,
				user_email: 'jane@mycustomdomain.com',
			} as unknown as UserSettings );
			mockIsAutomattician( false );
			mockAccountRecovery();

			render( <PersonalDetailsSection /> );

			expect( await screen.findByText( /lose access to account recovery/i ) ).toBeVisible();
		} );

		test( 'shows a CTA linking to the account recovery settings page', async () => {
			mockUserSettings( {
				...settings,
				user_email: 'jane@mycustomdomain.com',
			} as unknown as UserSettings );
			mockIsAutomattician( false );
			mockAccountRecovery();

			render( <PersonalDetailsSection /> );

			expect(
				await screen.findByRole( 'link', { name: /set up account recovery/i } )
			).toHaveAttribute( 'href', '/me/security/account-recovery' );
		} );

		test( 'does not warn when a recovery email is already set', async () => {
			mockUserSettings( {
				...settings,
				user_email: 'jane@mycustomdomain.com',
			} as unknown as UserSettings );
			mockIsAutomattician( false );
			mockAccountRecovery( { email: 'backup@gmail.com' } );

			render( <PersonalDetailsSection /> );

			await screen.findByRole( 'textbox', { name: 'Email address' } );
			expect( screen.queryByText( /lose access to account recovery/i ) ).not.toBeInTheDocument();
		} );

		test( 'does not warn when a recovery phone is already set', async () => {
			mockUserSettings( {
				...settings,
				user_email: 'jane@mycustomdomain.com',
			} as unknown as UserSettings );
			mockIsAutomattician( false );
			mockAccountRecovery( {
				phone: {
					country_code: 'US',
					country_numeric_code: '+1',
					number: '5551234',
					number_full: '+15551234',
				},
			} );

			render( <PersonalDetailsSection /> );

			await screen.findByRole( 'textbox', { name: 'Email address' } );
			expect( screen.queryByText( /lose access to account recovery/i ) ).not.toBeInTheDocument();
		} );

		test( 'does not warn for a free email provider', async () => {
			mockUserSettings( {
				...settings,
				user_email: 'jane@gmail.com',
			} as unknown as UserSettings );
			mockIsAutomattician( false );
			mockAccountRecovery();

			render( <PersonalDetailsSection /> );

			await screen.findByRole( 'textbox', { name: 'Email address' } );
			expect( screen.queryByText( /lose access to account recovery/i ) ).not.toBeInTheDocument();
		} );

		test( 'warns for a subdomain of a free email provider', async () => {
			mockUserSettings( {
				...settings,
				user_email: 'jane@mail.gmail.com',
			} as unknown as UserSettings );
			mockIsAutomattician( false );
			mockAccountRecovery();

			render( <PersonalDetailsSection /> );

			expect( await screen.findByText( /lose access to account recovery/i ) ).toBeVisible();
		} );

		test( 'disables save when email is invalid', async () => {
			const user = userEvent.setup();
			mockUserSettings( settings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );

			await waitFor( () => {
				expect( screen.getByRole( 'textbox', { name: 'Email address' } ) ).toBeVisible();
			} );

			const emailInput = screen.getByRole( 'textbox', { name: 'Email address' } );
			await user.clear( emailInput );
			await user.type( emailInput, 'invalid-email' );

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
			} );
		} );
	} );
	describe( 'avatar', () => {
		test( 'HTML entities get decoded before avatar URL is rendered', async () => {
			mockUserSettings( {
				...settings,
				avatar_URL: 'https://gravatar.com/avatar/abc123?s=96&amp;d=mm&amp;r=G',
			} as unknown as UserSettings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );
			await screen.findByRole( 'textbox', { name: 'Email address' } );

			const avatarImg = screen.getByAltText( 'Gravatar' );
			expect( avatarImg ).toBeVisible();
			expect( avatarImg ).toHaveAttribute(
				'src',
				expect.stringContaining( 'https://gravatar.com/avatar/abc123?s=96&d=mm&r=G' )
			);
		} );

		test( 'keeps the avatar src stable while typing in other fields', async () => {
			const user = userEvent.setup();
			mockUserSettings( settings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );
			await screen.findByRole( 'textbox', { name: 'Email address' } );

			const srcBefore = screen.getByAltText( 'Gravatar' ).getAttribute( 'src' );

			await user.type( screen.getByRole( 'textbox', { name: 'Display name' } ), 'abc' );

			expect( screen.getByAltText( 'Gravatar' ) ).toHaveAttribute( 'src', srcBefore );
		} );
	} );

	describe( 'display name field', () => {
		test( 'disables save when display name exceeds 250 characters', async () => {
			const user = userEvent.setup();
			mockUserSettings( settings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );
			await screen.findByRole( 'textbox', { name: 'Email address' } );

			const displayNameInput = screen.getByRole( 'textbox', { name: 'Display name' } );
			await user.clear( displayNameInput );
			await user.paste( 'a'.repeat( 251 ) );
			await user.tab();

			await waitFor( () => {
				expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
				expect( screen.getByText( 'Display name must be 250 characters or less.' ) ).toBeVisible();
			} );
		} );
	} );

	describe( 'web address field', () => {
		test( 'disables save when URL is invalid', async () => {
			const user = userEvent.setup();
			mockUserSettings( settings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );
			await screen.findByRole( 'textbox', { name: 'Email address' } );

			const urlInput = screen.getByRole( 'textbox', { name: 'Web address' } );
			await user.clear( urlInput );
			await user.type( urlInput, 'not-a-url' );
			await user.tab();

			expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
			expect( screen.getByText( 'Please enter a valid URL.' ) ).toBeVisible();
		} );
	} );
} );
