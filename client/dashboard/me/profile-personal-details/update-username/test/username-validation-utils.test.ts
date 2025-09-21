/**
 * @jest-environment jsdom
 */

import { debounce } from '@wordpress/compose';
import wpcom from 'calypso/lib/wp';
import {
	validateUsernameDebounced,
	isUsernameValid,
	getUsernameValidationMessage,
	getAllowedActions,
	submitUsernameChange,
	type ValidationResult,
} from '../username-validation-utils';

// Mock dependencies
jest.mock( '@wordpress/compose', () => ( {
	debounce: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
		post: jest.fn(),
	},
} ) );

const mockDebounce = debounce as jest.MockedFunction< typeof debounce >;
const mockWpcom = wpcom as jest.Mocked< typeof wpcom >;

const createMockDebouncedFn = () => {
	const mockValidationFn = jest.fn() as any;
	mockValidationFn.cancel = jest.fn();
	mockValidationFn.flush = jest.fn();
	mockValidationFn.pending = jest.fn();
	mockDebounce.mockReturnValue( mockValidationFn );
	return mockValidationFn;
};

describe( 'Username Validation Utils', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'validateUsernameDebounced', () => {
		it( 'is created with 600ms delay and delegates parameters correctly', () => {
			const mockDebouncedFn = createMockDebouncedFn();
			const setValidationResult = jest.fn();

			// Verify debounce was called with correct delay
			expect( mockDebounce ).toHaveBeenCalledWith( expect.any( Function ), 600 );

			validateUsernameDebounced( 'testuser', 'olduser', setValidationResult );
			expect( mockDebouncedFn ).toHaveBeenCalledWith( 'testuser', 'olduser', setValidationResult );
		} );

		it( 'validates username with API call', async () => {
			createMockDebouncedFn();

			mockWpcom.req.get.mockResolvedValue( {
				success: true,
				allowed_actions: { none: 'Just change username' },
			} );

			const setValidationResult = jest.fn();

			const actualValidationFn = mockDebounce.mock.calls[ 0 ][ 0 ] as any;

			await actualValidationFn( 'newusername', 'oldusername', setValidationResult );

			expect( mockWpcom.req.get ).toHaveBeenCalledWith( '/me/username/validate/newusername' );
			expect( setValidationResult ).toHaveBeenCalledWith( {
				success: true,
				allowed_actions: { none: 'Just change username' },
				validatedUsername: 'newusername',
			} );
		} );

		it( 'handles API errors', async () => {
			createMockDebouncedFn();

			const apiError = { error: 'username_taken', message: 'Username is already taken' };
			mockWpcom.req.get.mockRejectedValue( apiError );

			const setValidationResult = jest.fn();
			const actualValidationFn = mockDebounce.mock.calls[ 0 ][ 0 ] as any;

			await actualValidationFn( 'takenusername', 'oldusername', setValidationResult );

			expect( setValidationResult ).toHaveBeenCalledWith( apiError );
		} );

		it( 'skips validation when username matches current username', async () => {
			createMockDebouncedFn();

			const setValidationResult = jest.fn();
			const actualValidationFn = mockDebounce.mock.calls[ 0 ][ 0 ] as any;

			await actualValidationFn( 'sameusername', 'sameusername', setValidationResult );

			expect( mockWpcom.req.get ).not.toHaveBeenCalled();
			expect( setValidationResult ).toHaveBeenCalledWith( null );
		} );

		it( 'validates minimum length requirement', async () => {
			createMockDebouncedFn();

			const setValidationResult = jest.fn();
			const actualValidationFn = mockDebounce.mock.calls[ 0 ][ 0 ] as any;

			await actualValidationFn( 'ab', 'oldusername', setValidationResult );

			expect( mockWpcom.req.get ).not.toHaveBeenCalled();
			expect( setValidationResult ).toHaveBeenCalledWith( {
				error: 'invalid_input',
				message: 'Usernames must be at least 4 characters.',
			} );
		} );

		it( 'validates allowed characters', async () => {
			createMockDebouncedFn();

			const setValidationResult = jest.fn();
			const actualValidationFn = mockDebounce.mock.calls[ 0 ][ 0 ] as any;

			await actualValidationFn( 'user@name', 'oldusername', setValidationResult );

			expect( mockWpcom.req.get ).not.toHaveBeenCalled();
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

	describe( 'submitUsernameChange', () => {
		it( 'calls API with correct parameters', async () => {
			mockWpcom.req.post.mockResolvedValue( { success: true } );

			await submitUsernameChange( 'newusername', 'redirect' );

			expect( mockWpcom.req.post ).toHaveBeenCalledWith( '/me/username', {
				username: 'newusername',
				action: 'redirect',
			} );
		} );

		it( 'returns API response', async () => {
			const expectedResponse = { success: true, message: 'Username changed' };
			mockWpcom.req.post.mockResolvedValue( expectedResponse );

			const result = await submitUsernameChange( 'newusername', 'none' );

			expect( result ).toEqual( expectedResponse );
		} );

		it( 'propagates API errors', async () => {
			const apiError = new Error( 'Network error' );
			mockWpcom.req.post.mockRejectedValue( apiError );

			await expect( submitUsernameChange( 'newusername', 'none' ) ).rejects.toThrow(
				'Network error'
			);
		} );
	} );
} );
