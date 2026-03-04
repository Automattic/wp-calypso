/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import GravatarProfileSection from '../index';
import type { UserSettings } from '@automattic/api-core';

const settings = {
	display_name: 'John Doe',
	user_URL: 'https://example.com',
	description: 'Hello world',
	user_email: 'john@example.com',
	avatar_URL: 'https://gravatar.com/avatar/test',
} as unknown as UserSettings;

function mockUserSettings( data: UserSettings ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.reply( 200, data );
}

describe( '<GravatarProfileSection>', () => {
	test( 'renders the form and saves the form', async () => {
		const user = userEvent.setup();
		mockUserSettings( settings );

		render( <GravatarProfileSection /> );
		await screen.findByRole( 'heading', { name: 'Public Gravatar profile' } );

		expect( screen.getByRole( 'textbox', { name: 'Display name' } ) ).toHaveValue( 'John Doe' );
		expect( screen.getByRole( 'textbox', { name: 'Web address' } ) ).toHaveValue(
			'https://example.com'
		);
		expect( screen.getByRole( 'textbox', { name: 'About me' } ) ).toHaveValue( 'Hello world' );

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
						display_name: 'Jane Smith',
						description: 'Updated bio',
					} )
				);
				return true;
			} )
			.reply( 200, {
				...settings,
				display_name: 'Jane Smith',
				description: 'Updated bio',
			} );

		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	describe( 'display name field', () => {
		test( 'disables save when display name exceeds 250 characters', async () => {
			const user = userEvent.setup();
			mockUserSettings( settings );

			render( <GravatarProfileSection /> );
			await screen.findByRole( 'heading', { name: 'Public Gravatar profile' } );

			const displayNameInput = screen.getByRole( 'textbox', { name: 'Display name' } );
			await user.clear( displayNameInput );
			await user.type( displayNameInput, 'a'.repeat( 251 ) );
			await user.tab();

			expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
			expect( screen.getByText( 'Display name must be 250 characters or less.' ) ).toBeVisible();
		} );
	} );

	describe( 'web address field', () => {
		test( 'disables save when URL is invalid', async () => {
			const user = userEvent.setup();
			mockUserSettings( settings );

			render( <GravatarProfileSection /> );
			await screen.findByRole( 'heading', { name: 'Public Gravatar profile' } );

			const urlInput = screen.getByRole( 'textbox', { name: 'Web address' } );
			await user.clear( urlInput );
			await user.type( urlInput, 'not-a-url' );
			await user.tab();

			expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
			expect( screen.getByText( 'Please enter a valid URL.' ) ).toBeVisible();
		} );
	} );
} );
