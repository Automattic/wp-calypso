/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PersonalDetailsSection from '../index';
import {
	mockUserSettings,
	mockAutomatticianUserSettings,
	mockUnverifiedEmailUserSettings,
} from './__mocks__/user-settings';

// Mock the username validation utils
jest.mock( '../update-username/username-validation-utils', () => ( {
	validateUsernameDebounced: jest.fn(),
	isUsernameValid: jest.fn(),
	getUsernameValidationMessage: jest.fn(),
} ) );

const renderWithUserData = ( userData = mockUserSettings ) => {
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, userData );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/is-automattician' )
		.reply( 200, { is_automattician: userData.user_email?.includes( 'automattic.com' ) || false } );

	const result = render( <PersonalDetailsSection profile={ userData } /> );

	// Mock the query data
	result.queryClient.setQueryData( [ 'user-settings' ], userData );
	result.queryClient.setQueryData( [ 'is-automattician' ], {
		is_automattician: userData.user_email?.includes( 'automattic.com' ) || false,
	} );

	return result;
};

describe( 'PersonalDetailsSection', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	describe( 'Basic rendering', () => {
		it( 'renders the form with all sections', async () => {
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByText( 'Personal details' ) ).toBeInTheDocument();
			} );

			expect( screen.getByLabelText( 'First name' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'Last name' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'Username' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'Email address' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'I am a developer' ) ).toBeInTheDocument();
		} );

		it( 'populates fields with user data', async () => {
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'Test' ) ).toBeInTheDocument();
				expect( screen.getByDisplayValue( 'User' ) ).toBeInTheDocument();
				expect( screen.getByDisplayValue( 'testuser' ) ).toBeInTheDocument();
				expect( screen.getByDisplayValue( 'test@example.com' ) ).toBeInTheDocument();
			} );
		} );

		it( 'shows save button when form is not dirty', async () => {
			renderWithUserData();

			await waitFor( () => {
				const saveButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( saveButton ).toBeInTheDocument();
				expect( saveButton ).toBeDisabled();
			} );
		} );
	} );

	describe( 'Form interactions', () => {
		it( 'enables save button when form is dirty', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'Test' ) ).toBeInTheDocument();
			} );

			const firstNameInput = screen.getByDisplayValue( 'Test' );
			await user.clear( firstNameInput );
			await user.type( firstNameInput, 'Updated' );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );
			expect( saveButton ).toBeEnabled();
		} );

		it( 'toggles developer checkbox', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByLabelText( 'I am a developer' ) ).toBeInTheDocument();
			} );

			const checkbox = screen.getByLabelText( 'I am a developer' );
			expect( checkbox ).not.toBeChecked();

			await user.click( checkbox );
			expect( checkbox ).toBeChecked();
		} );

		it( 'submits form with updated data', async () => {
			const user = userEvent.setup();
			nock( 'https://public-api.wordpress.com' )
				.put( '/rest/v1.1/me/settings' )
				.reply( 200, { ...mockUserSettings, first_name: 'Updated' } );

			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'Test' ) ).toBeInTheDocument();
			} );

			const firstNameInput = screen.getByDisplayValue( 'Test' );
			await user.clear( firstNameInput );
			await user.type( firstNameInput, 'Updated' );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );
			await user.click( saveButton );

			expect( saveButton ).toHaveAttribute( 'aria-busy', 'true' );
		} );
	} );

	describe( 'Username field restrictions', () => {
		it( 'disables username field for Automatticians', async () => {
			renderWithUserData( mockAutomatticianUserSettings );

			await waitFor( () => {
				const usernameInput = screen.getByLabelText( 'Username' );
				expect( usernameInput ).toBeDisabled();
				expect(
					screen.getByText( 'Automatticians cannot change their username.' )
				).toBeInTheDocument();
			} );
		} );

		it( 'disables username field for unverified email users', async () => {
			renderWithUserData( mockUnverifiedEmailUserSettings );

			await waitFor( () => {
				const usernameInput = screen.getByLabelText( 'Username' );
				expect( usernameInput ).toBeDisabled();
				expect(
					screen.getByText( 'Username can be changed once your email address is verified.' )
				).toBeInTheDocument();
			} );
		} );

		it( 'enables username field for eligible users', async () => {
			renderWithUserData();

			await waitFor( () => {
				const usernameInput = screen.getByLabelText( 'Username' );
				expect( usernameInput ).toBeEnabled();
			} );
		} );
	} );

	describe( 'Username change flow', () => {
		it( 'shows username update form when username is changed', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'testuser' ) ).toBeInTheDocument();
			} );

			const usernameInput = screen.getByDisplayValue( 'testuser' );
			await user.clear( usernameInput );
			await user.type( usernameInput, 'newusername' );

			expect( screen.getByText( 'Confirm new username' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Change username' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeInTheDocument();
		} );

		it( 'hides save button when username change is pending', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'testuser' ) ).toBeInTheDocument();
			} );

			const usernameInput = screen.getByDisplayValue( 'testuser' );
			await user.clear( usernameInput );
			await user.type( usernameInput, 'newusername' );

			expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Success and error states', () => {
		it( 'shows success notice on successful username change', async () => {
			Object.defineProperty( window, 'location', {
				value: {
					search: '?usernameChangeSuccess=true',
					href: 'http://localhost/?usernameChangeSuccess=true',
				},
				writable: true,
			} );

			Object.defineProperty( window, 'history', {
				value: {
					replaceState: jest.fn(),
				},
			} );

			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByText( 'Username changed successfully!' ) ).toBeInTheDocument();
			} );
		} );

		it( 'shows error notice on mutation error', async () => {
			const user = userEvent.setup();
			nock( 'https://public-api.wordpress.com' )
				.put( '/rest/v1.1/me/settings' )
				.reply( 500, { message: 'Server error' } );

			const { queryClient } = renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'Test' ) ).toBeInTheDocument();
			} );

			const firstNameInput = screen.getByDisplayValue( 'Test' );
			await user.clear( firstNameInput );
			await user.type( firstNameInput, 'Updated' );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );
			await user.click( saveButton );

			queryClient.setMutationDefaults( [ 'user-settings' ], {
				mutationFn: () => Promise.reject( new Error( 'Server error' ) ),
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Server error' ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'has proper ARIA labels and structure', async () => {
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByRole( 'form' ) ).toHaveAttribute(
					'aria-labelledby',
					'personal-details-heading'
				);
				expect( screen.getByRole( 'heading', { name: 'Personal details' } ) ).toHaveAttribute(
					'id',
					'personal-details-heading'
				);
			} );
		} );

		it( 'has proper input autocomplete attributes', async () => {
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByLabelText( 'Username' ) ).toHaveAttribute( 'autocomplete', 'username' );
				expect( screen.getByLabelText( 'Email address' ) ).toHaveAttribute(
					'autocomplete',
					'email'
				);
			} );
		} );

		it( 'has proper ARIA attributes for success notice', async () => {
			Object.defineProperty( window, 'location', {
				value: {
					search: '?usernameChangeSuccess=true',
					href: 'http://localhost/?usernameChangeSuccess=true',
				},
				writable: true,
			} );

			renderWithUserData();

			await waitFor( () => {
				const notice = screen
					.getByText( 'Username changed successfully!' )
					.closest( '[role="status"]' );
				expect( notice ).toHaveAttribute( 'aria-live', 'polite' );
			} );
		} );
	} );
} );
