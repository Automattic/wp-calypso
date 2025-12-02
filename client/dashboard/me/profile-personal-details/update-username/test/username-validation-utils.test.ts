/**
 * @jest-environment jsdom
 */
import { validateUsername } from '@automattic/api-core';
import {
	validateUsernameDebounced,
	isUsernameValid,
	getUsernameValidationMessage,
	getAllowedActions,
	type ValidationResult,
} from '../username-validation-utils';

type ValidateUsernameFn = (
	username: string,
	currentUsername: string,
	setValidationResult: ( result: ValidationResult | null ) => void
) => Promise< void >;
type MockedValidateUsernameFn = jest.MockedFunction< ValidateUsernameFn > & {
	_originalFn: ValidateUsernameFn;
	cancel: jest.MockedFunction< () => void >;
	flush: jest.MockedFunction< () => void >;
	pending: jest.MockedFunction< () => boolean >;
};

// Mock dependencies
jest.mock( '@wordpress/compose', () => {
	const mockFn = jest.fn() as unknown as MockedValidateUsernameFn;
	mockFn.cancel = jest.fn();
	mockFn.flush = jest.fn();
	mockFn.pending = jest.fn();
	mockFn._originalFn = jest.fn();

	return {
		debounce: jest.fn( ( fn ) => {
			mockFn._originalFn = fn;
			return mockFn;
		} ),
	};
} );

jest.mock( '@automattic/api-core', () => ( {
	validateUsername: jest.fn(),
	updateUsername: jest.fn(),
} ) );

const mockValidateUsername = validateUsername as jest.MockedFunction< typeof validateUsername >;

describe( 'Username Validation Utils', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'validateUsernameDebounced', () => {
		it( 'is a debounced function that delegates parameters correctly', () => {
			const setValidationResult = jest.fn();

			expect( typeof validateUsernameDebounced ).toBe( 'function' );
			expect( validateUsernameDebounced ).toHaveProperty( 'cancel' );
			expect( validateUsernameDebounced ).toHaveProperty( 'flush' );

			validateUsernameDebounced( 'testuser', 'olduser', setValidationResult );

			expect( validateUsernameDebounced ).toHaveBeenCalledWith(
				'testuser',
				'olduser',
				setValidationResult
			);
		} );

		it( 'validates username with API call', async () => {
			mockValidateUsername.mockResolvedValue( {
				success: true,
				allowed_actions: { none: 'Just change username' },
			} );

			const setValidationResult = jest.fn();
			const actualValidationFn = ( validateUsernameDebounced as MockedValidateUsernameFn )
				._originalFn;

			await actualValidationFn( 'newusername', 'oldusername', setValidationResult );

			expect( mockValidateUsername ).toHaveBeenCalledWith( 'newusername' );
			expect( setValidationResult ).toHaveBeenCalledWith( {
				success: true,
				allowed_actions: { none: 'Just change username' },
				validatedUsername: 'newusername',
			} );
		} );

		it( 'handles API errors', async () => {
			const apiError = { error: 'username_taken', message: 'Username is already taken' };
			mockValidateUsername.mockRejectedValue( apiError );

			const setValidationResult = jest.fn();
			const actualValidationFn = ( validateUsernameDebounced as MockedValidateUsernameFn )
				._originalFn;

			await actualValidationFn( 'takenusername', 'oldusername', setValidationResult );

			expect( setValidationResult ).toHaveBeenCalledWith( apiError );
		} );

		it( 'skips validation when username matches current username', async () => {
			const setValidationResult = jest.fn();
			const actualValidationFn = ( validateUsernameDebounced as MockedValidateUsernameFn )
				._originalFn;

			await actualValidationFn( 'sameusername', 'sameusername', setValidationResult );

			expect( mockValidateUsername ).not.toHaveBeenCalled();
			expect( setValidationResult ).toHaveBeenCalledWith( null );
		} );

		it( 'validates minimum length requirement', async () => {
			const setValidationResult = jest.fn();
			const actualValidationFn = ( validateUsernameDebounced as MockedValidateUsernameFn )
				._originalFn;

			await actualValidationFn( 'ab', 'oldusername', setValidationResult );

			expect( mockValidateUsername ).not.toHaveBeenCalled();
			expect( setValidationResult ).toHaveBeenCalledWith( {
				error: 'invalid_input',
				message: 'Usernames must be at least 4 characters.',
			} );
		} );

		it( 'validates allowed characters', async () => {
			const setValidationResult = jest.fn();
			const actualValidationFn = ( validateUsernameDebounced as MockedValidateUsernameFn )
				._originalFn;

			await actualValidationFn( 'user@name', 'oldusername', setValidationResult );

			expect( mockValidateUsername ).not.toHaveBeenCalled();
			expect( setValidationResult ).toHaveBeenCalledWith( {
				error: 'invalid_input',
				message: 'Usernames can only contain lowercase letters (a-z) and numbers.',
			} );
		} );
	} );

	describe( 'isUsernameValid', () => {
		it( 'returns true for valid validation result', () => {
			const validResult: ValidationResult = { success: true };
			expect( isUsernameValid( validResult ) ).toBe( true );
		} );

		it( 'returns false for null validation result', () => {
			expect( isUsernameValid( null ) ).toBe( false );
		} );

		it( 'returns false for validation result with error', () => {
			const errorResult: ValidationResult = {
				error: 'username_taken',
				message: 'Username is already taken',
			};
			expect( isUsernameValid( errorResult ) ).toBe( false );
		} );
	} );

	describe( 'getUsernameValidationMessage', () => {
		it( 'returns message or null correctly', () => {
			expect( getUsernameValidationMessage( { message: 'error' } ) ).toBe( 'error' );
			expect( getUsernameValidationMessage( { error: 'no message' } ) ).toBe( null );
			expect( getUsernameValidationMessage( null ) ).toBe( null );
		} );
	} );

	describe( 'getAllowedActions', () => {
		it( 'returns allowed actions from validation result', () => {
			const result: ValidationResult = {
				success: true,
				allowed_actions: {
					none: 'Just change username',
					redirect: 'Create matching blog address',
				},
			};
			expect( getAllowedActions( result ) ).toEqual( {
				none: 'Just change username',
				redirect: 'Create matching blog address',
			} );
		} );

		it( 'returns empty object for validation result without allowed_actions', () => {
			const result: ValidationResult = { success: true };
			expect( getAllowedActions( result ) ).toEqual( {} );
		} );
	} );
} );
