/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useDispatch } from '@wordpress/data';
import { render } from '../../../test-utils';
import GravatarProfileSection from '../index';
import type { UserProfile } from '@automattic/api-core';

// Mock the WordPress data store
jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	createSelector: jest.fn(),
	register: jest.fn(),
} ) );

// Mock the profile mutation
jest.mock( '@automattic/api-queries', () => ( {
	profileMutation: jest.fn( () => ( {
		mutationFn: jest.fn(),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useMutation: jest.fn( () => ( {
		mutate: jest.fn(),
		isPending: false,
		error: null,
	} ) ),
} ) );

// Mock URL validation
jest.mock( '../../../../lib/importer/url-validation', () => ( {
	isValidUrl: jest.fn( ( url ) => {
		return url && ( url.startsWith( 'http://' ) || url.startsWith( 'https://' ) );
	} ),
} ) );

const mockProfile: UserProfile = {
	advertising_targeting_opt_out: false,
	avatar_URL: 'https://gravatar.com/avatar/test',
	description: 'Test description',
	display_name: 'Test User',
	is_dev_account: false,
	password: 'password',
	tracks_opt_out: false,
	user_email: 'test@example.com',
	user_login: 'testuser',
	user_URL: 'https://example.com',
};

describe( 'GravatarProfileSection Form Validation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( useDispatch as jest.Mock ).mockReturnValue( {
			createSuccessNotice: jest.fn(),
			createErrorNotice: jest.fn(),
		} );
	} );

	describe( 'Display Name Validation', () => {
		it( 'should show validation error for display names longer than 250 characters', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockProfile } /> );

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
			render( <GravatarProfileSection profile={ mockProfile } /> );

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
			render( <GravatarProfileSection profile={ mockProfile } /> );

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
			render( <GravatarProfileSection profile={ mockProfile } /> );

			const urlInput = screen.getByDisplayValue( 'https://example.com' );

			await user.clear( urlInput );
			await user.type( urlInput, 'not-a-url' );
			fireEvent.blur( urlInput );

			expect( screen.getByText( 'Please enter a valid URL.' ) ).toBeInTheDocument();
		} );

		it( 'should accept valid URLs', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockProfile } /> );

			const urlInput = screen.getByDisplayValue( 'https://example.com' );

			await user.clear( urlInput );
			await user.type( urlInput, 'https://valid-url.com' );
			fireEvent.blur( urlInput );

			expect( screen.queryByText( 'Please enter a valid URL.' ) ).not.toBeInTheDocument();
		} );

		it( 'should allow empty URLs (optional field)', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockProfile } /> );

			const urlInput = screen.getByDisplayValue( 'https://example.com' );

			await user.clear( urlInput );
			fireEvent.blur( urlInput );

			expect( screen.queryByText( 'Please enter a valid URL.' ) ).not.toBeInTheDocument();
		} );

		it( 'should disable save button when URL validation fails', async () => {
			const user = userEvent.setup();
			render( <GravatarProfileSection profile={ mockProfile } /> );

			const urlInput = screen.getByDisplayValue( 'https://example.com' );

			await user.clear( urlInput );
			await user.type( urlInput, 'invalid-url' );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );
			expect( saveButton ).toBeDisabled();
		} );
	} );
} );
