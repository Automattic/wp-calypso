/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { render } from '../../../test-utils';
import { mockUserSettings } from '../../profile/__mocks__/user-settings';
import GravatarProfileSection from '../index';

describe( 'GravatarProfileSection Form Validation', () => {
	describe( 'Display Name Validation', () => {
		it( 'should show validation error for display names longer than 250 characters', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockUserSettings } /> );

			const displayNameInput = screen.getByDisplayValue( 'Test User' );
			const longName = 'a'.repeat( 251 );

			await user.clear( displayNameInput );
			await user.type( displayNameInput, longName );
			fireEvent.blur( displayNameInput );

			expect(
				screen.getByText( 'Display name must be 250 characters or less.' )
			).toBeInTheDocument();
		} );

		it( 'should accept display names at the character limit', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockUserSettings } /> );

			const displayNameInput = screen.getByDisplayValue( 'Test User' );
			const maxLengthName = 'a'.repeat( 250 );

			await user.clear( displayNameInput );
			await user.type( displayNameInput, maxLengthName );
			fireEvent.blur( displayNameInput );

			expect(
				screen.queryByText( 'Display name must be 250 characters or less.' )
			).not.toBeInTheDocument();
		} );

		it( 'should disable save button when display name validation fails', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockUserSettings } /> );

			const displayNameInput = screen.getByDisplayValue( 'Test User' );
			const longName = 'a'.repeat( 251 );

			await user.clear( displayNameInput );
			await user.type( displayNameInput, longName );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );
			expect( saveButton ).toBeDisabled();
		} );
	} );

	describe( 'URL Validation', () => {
		it( 'should show validation error for invalid URLs', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockUserSettings } /> );

			const urlInput = screen.getByDisplayValue( 'https://example.com' );

			await user.clear( urlInput );
			await user.type( urlInput, 'not-a-url' );
			fireEvent.blur( urlInput );

			expect( screen.getByText( 'Please enter a valid URL.' ) ).toBeInTheDocument();
		} );

		it( 'should accept valid URLs', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockUserSettings } /> );

			const urlInput = screen.getByDisplayValue( 'https://example.com' );

			await user.clear( urlInput );
			await user.type( urlInput, 'https://valid-url.com' );
			fireEvent.blur( urlInput );

			expect( screen.queryByText( 'Please enter a valid URL.' ) ).not.toBeInTheDocument();
		} );

		it( 'should allow empty URLs (optional field)', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockUserSettings } /> );

			const urlInput = screen.getByDisplayValue( 'https://example.com' );

			await user.clear( urlInput );
			fireEvent.blur( urlInput );

			expect( screen.queryByText( 'Please enter a valid URL.' ) ).not.toBeInTheDocument();
		} );

		it( 'should disable save button when URL validation fails', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockUserSettings } /> );

			const urlInput = screen.getByDisplayValue( 'https://example.com' );

			await user.clear( urlInput );
			await user.type( urlInput, 'invalid-url' );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );
			expect( saveButton ).toBeDisabled();
		} );
	} );
} );
