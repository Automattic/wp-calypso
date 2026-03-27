/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PersonalDetailsSection from '../index';
import type { UserSettings } from '@automattic/api-core';

const settings = {
	first_name: 'John',
	last_name: 'Doe',
	user_login: 'johndoe',
	user_email: 'john@example.com',
	email_verified: true,
	user_login_can_be_changed: true,
	is_dev_account: false,
} as unknown as UserSettings;

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

describe( '<PersonalDetailsSection>', () => {
	test( 'renders the form and saves the form', async () => {
		const user = userEvent.setup();
		mockUserSettings( settings );
		mockIsAutomattician( false );

		render( <PersonalDetailsSection /> );
		await screen.findByRole( 'heading', { name: 'Personal details' } );

		expect( screen.getByRole( 'textbox', { name: 'First name' } ) ).toHaveValue( 'John' );
		expect( screen.getByRole( 'textbox', { name: 'Last name' } ) ).toHaveValue( 'Doe' );
		expect( screen.getByRole( 'textbox', { name: 'Username' } ) ).toHaveValue( 'johndoe' );
		expect( screen.getByRole( 'textbox', { name: 'Email address' } ) ).toHaveValue(
			'john@example.com'
		);
		expect( screen.getByRole( 'checkbox', { name: 'I am a developer' } ) ).not.toBeChecked();

		const firstNameInput = screen.getByRole( 'textbox', { name: 'First name' } );
		await user.clear( firstNameInput );
		await user.type( firstNameInput, 'Jane' );

		const lastNameInput = screen.getByRole( 'textbox', { name: 'Last name' } );
		await user.clear( lastNameInput );
		await user.type( lastNameInput, 'Smith' );

		const emailInput = screen.getByRole( 'textbox', { name: 'Email address' } );
		await user.clear( emailInput );
		await user.type( emailInput, 'jane@example.com' );

		const devCheckbox = screen.getByRole( 'checkbox', { name: 'I am a developer' } );
		await user.click( devCheckbox );

		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', ( body ) => {
				expect( body ).toEqual(
					expect.objectContaining( {
						first_name: 'Jane',
						last_name: 'Smith',
						user_email: 'jane@example.com',
						is_dev_account: true,
					} )
				);
				return true;
			} )
			.reply( 200, {
				...settings,
				first_name: 'Jane',
				last_name: 'Smith',
				user_email: 'jane@example.com',
				is_dev_account: true,
			} );

		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
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
			mockUserSettings( { ...settings, email_verified: false } as unknown as UserSettings );
			mockIsAutomattician( false );

			render( <PersonalDetailsSection /> );

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
} );
