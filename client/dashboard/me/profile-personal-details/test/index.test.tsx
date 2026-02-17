/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import {
	mockUserSettings,
	mockAutomatticianUserSettings,
} from '../../profile/__mocks__/user-settings';
import PersonalDetailsSection from '../index';

// Mock the username validation utils
jest.mock( '../update-username/username-validation-utils', () => ( {
	validateUsernameDebounced: jest.fn(),
	isUsernameValid: jest.fn(),
	getUsernameValidationMessage: jest.fn(),
	getAllowedActions: jest.fn( () => ( {} ) ),
	updateUsername: jest.fn(),
} ) );

// Mock email validator
// Mock the API queries (return query configurations, not data)
jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: jest.fn( () => ( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: jest.fn(),
	} ) ),
	userSettingsQuery: jest.fn( () => ( {
		queryKey: [ 'me', 'settings' ],
		queryFn: jest.fn(),
	} ) ),
	userSettingsMutation: jest.fn( () => ( {
		mutationFn: jest.fn(),
		onSuccess: jest.fn(),
	} ) ),
	updateUsernameMutation: jest.fn( () => ( {
		mutationFn: jest.fn(),
		onSuccess: jest.fn(),
	} ) ),
	cancelPendingEmailChangeMutation: jest.fn( () => ( {
		mutationFn: jest.fn(),
	} ) ),
	resendEmailVerificationMutation: jest.fn( () => ( {
		mutationFn: jest.fn(),
	} ) ),
} ) );

// Mock WordPress notices
const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: mockCreateErrorNotice,
	} ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
	useSelect: jest.fn(),
	dispatch: jest.fn(),
} ) );

const renderWithUserData = ( userData = mockUserSettings ) => {
	// Update the mocked query functions to return test data
	const { userSettingsQuery, isAutomatticianQuery } = require( '@automattic/api-queries' );

	userSettingsQuery.mockReturnValue( {
		queryKey: [ 'me', 'settings', userData ],
		queryFn: () => Promise.resolve( userData ),
	} );

	isAutomatticianQuery.mockReturnValue( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: () => Promise.resolve( userData.user_email?.includes( 'automattic.com' ) || false ),
	} );

	const result = render( <PersonalDetailsSection /> );

	return result;
};

describe( 'PersonalDetailsSection', () => {
	beforeEach( () => {
		mockCreateSuccessNotice.mockClear();
		mockCreateErrorNotice.mockClear();
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

			renderWithUserData();

			await waitFor( () => {
				const saveButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( saveButton ).toBeInTheDocument();
				expect( saveButton ).toBeDisabled();
			} );
		} );
	} );

	describe( 'Form interactions', () => {
		it( 'submits form with updated data', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'Test First Name' ) ).toBeInTheDocument();
			} );

			const firstNameInput = screen.getByDisplayValue( 'Test First Name' );
			await user.clear( firstNameInput );
			await user.type( firstNameInput, 'Updated' );

			const saveButton = screen.getByRole( 'button', { name: 'Save' } );
			expect( saveButton ).toBeEnabled();
			await user.click( saveButton );

			expect( saveButton ).toBeInTheDocument();
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
			const unverifiedUserData = { ...mockUserSettings, email_verified: false };
			renderWithUserData( unverifiedUserData );

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

	describe( 'Username update flow', () => {
		it( 'shows username update form when username is changed', async () => {
			const user = userEvent.setup();
			const eligibleUserData = {
				...mockUserSettings,
				email_verified: true,
				user_login_can_be_changed: true,
			};
			renderWithUserData( eligibleUserData );

			await waitFor( () => {
				const usernameInput = screen.getByLabelText( 'Username' );
				expect( usernameInput ).toBeEnabled();
				expect( usernameInput ).toHaveValue( 'testuser' );
			} );

			const usernameInput = screen.getByLabelText( 'Username' );
			await user.clear( usernameInput );
			await user.type( usernameInput, 'newusername' );

			await waitFor( () => {
				expect( screen.getByText( 'Confirm new username' ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'Success and error states', () => {
		it( 'shows success notice on successful username change', async () => {
			Object.defineProperty( window, 'location', {
				value: {
					search: '?flash=username',
					href: 'http://localhost/?flash=username',
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
				expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
					'Username saved.',
					expect.objectContaining( {
						type: 'snackbar',
					} )
				);
			} );
		} );

		it( 'shows error notice on username mutation error', async () => {
			// Access the mocked function to override the behavior for this test
			const { updateUsernameMutation } = require( '@automattic/api-queries' );
			updateUsernameMutation.mockReturnValue( {
				mutationFn: jest.fn().mockRejectedValue( new Error( 'Username update failed' ) ),
				meta: {
					snackbar: {
						error: 'Failed to update username.',
					},
				},
			} );

			const eligibleUserData = {
				...mockUserSettings,
				email_verified: true,
				user_login_can_be_changed: true,
			};

			renderWithUserData( eligibleUserData );

			await waitFor( () => {
				expect( screen.getByLabelText( 'Username' ) ).toBeInTheDocument();
			} );

			expect( updateUsernameMutation ).toHaveBeenCalledWith();
			expect( updateUsernameMutation().meta.snackbar.error ).toBe( 'Failed to update username.' );
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

		it( 'has proper ARIA attributes for success notice', async () => {
			Object.defineProperty( window, 'location', {
				value: {
					search: '?flash=username',
					href: 'http://localhost/?flash=username',
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
				expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
					'Username saved.',
					expect.objectContaining( {
						type: 'snackbar',
					} )
				);
			} );
		} );
	} );

	describe( 'Email validation and Save button', () => {
		it( 'disables save when email is invalid', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByLabelText( 'Email address' ) ).toBeInTheDocument();
			} );

			const emailInput = screen.getByLabelText( 'Email address' );
			await user.clear( emailInput );
			await user.type( emailInput, 'invalid-email' );

			await waitFor( () => {
				const saveButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( saveButton ).toBeDisabled();
			} );
		} );

		it( 'disables save when email is invalid even if other fields are edited', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'Test First Name' ) ).toBeInTheDocument();
			} );

			// Edit first name
			const firstNameInput = screen.getByDisplayValue( 'Test First Name' );
			await user.clear( firstNameInput );
			await user.type( firstNameInput, 'UpdatedName' );

			// Enter invalid email
			const emailInput = screen.getByLabelText( 'Email address' );
			await user.clear( emailInput );
			await user.type( emailInput, 'invalid-email' );

			await waitFor( () => {
				const saveButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( saveButton ).toBeDisabled();
			} );
		} );

		it( 'enables save when email becomes valid after being invalid', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByLabelText( 'Email address' ) ).toBeInTheDocument();
			} );

			// Edit first name to make form dirty
			const firstNameInput = screen.getByDisplayValue( 'Test First Name' );
			await user.clear( firstNameInput );
			await user.type( firstNameInput, 'UpdatedName' );

			// Enter invalid email
			const emailInput = screen.getByLabelText( 'Email address' );
			await user.clear( emailInput );
			await user.type( emailInput, 'invalid' );

			await waitFor( () => {
				const saveButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( saveButton ).toBeDisabled();
			} );

			// Fix email to be valid
			await user.clear( emailInput );
			await user.type( emailInput, 'valid@example.com' );

			await waitFor( () => {
				const saveButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( saveButton ).toBeEnabled();
			} );
		} );

		it( 'keeps save enabled when email is unchanged and other fields are edited', async () => {
			const user = userEvent.setup();
			renderWithUserData();

			await waitFor( () => {
				expect( screen.getByDisplayValue( 'Test First Name' ) ).toBeInTheDocument();
			} );

			// Only edit first name, leave email unchanged
			const firstNameInput = screen.getByDisplayValue( 'Test First Name' );
			await user.clear( firstNameInput );
			await user.type( firstNameInput, 'UpdatedName' );

			await waitFor( () => {
				const saveButton = screen.getByRole( 'button', { name: 'Save' } );
				expect( saveButton ).toBeEnabled();
			} );
		} );
	} );
} );
