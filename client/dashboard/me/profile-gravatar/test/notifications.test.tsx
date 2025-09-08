/**
 * @jest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useDispatch } from '@wordpress/data';
import { render } from '../../../test-utils';
import GravatarProfileSection from '../index';
import type { UserProfile } from '@automattic/api-core';

// Mock the WordPress data store
const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	createSelector: jest.fn(),
	register: jest.fn(),
} ) );

// Mock the profile mutation
const mockMutate = jest.fn();
jest.mock( '@automattic/api-queries', () => ( {
	profileMutation: jest.fn( () => ( {
		mutationFn: jest.fn(),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useMutation: jest.fn( () => ( {
		mutate: mockMutate,
		isPending: false,
		error: null,
	} ) ),
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

describe( 'GravatarProfileSection Notifications', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( useDispatch as jest.Mock ).mockReturnValue( {
			createSuccessNotice: mockCreateSuccessNotice,
			createErrorNotice: mockCreateErrorNotice,
		} );
	} );

	it( 'should show success notification when form is saved successfully', async () => {
		const user = userEvent.setup();
		render( <GravatarProfileSection profile={ mockProfile } /> );

		// Make a change to enable the save button
		const displayNameInput = screen.getByDisplayValue( 'Test User' );
		await user.clear( displayNameInput );
		await user.type( displayNameInput, 'Updated User' );

		// Submit the form
		const saveButton = screen.getByRole( 'button', { name: 'Save' } );
		await user.click( saveButton );

		// Verify the mutation was called
		expect( mockMutate ).toHaveBeenCalled();

		// Simulate successful mutation by calling the onSuccess callback
		await act( async () => {
			const mutateCall = mockMutate.mock.calls[ 0 ];
			const options = mutateCall[ 1 ];
			options.onSuccess();
		} );

		// Verify success notification was called
		expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
			'Public Gravatar profile saved successfully.',
			{ type: 'snackbar' }
		);
	} );

	it( 'should show error notification when form save fails with error message', async () => {
		const user = userEvent.setup();
		render( <GravatarProfileSection profile={ mockProfile } /> );

		// Make a change to enable the save button
		const displayNameInput = screen.getByDisplayValue( 'Test User' );
		await user.clear( displayNameInput );
		await user.type( displayNameInput, 'Updated User' );

		// Submit the form
		const saveButton = screen.getByRole( 'button', { name: 'Save' } );
		await user.click( saveButton );

		// Simulate failed mutation by calling the onError callback
		await act( async () => {
			const mutateCall = mockMutate.mock.calls[ 0 ];
			const options = mutateCall[ 1 ];
			const error = new Error( 'Network error occurred' );
			options.onError( error );
		} );

		// Verify error notification was called with the error message
		expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Network error occurred', {
			type: 'snackbar',
		} );
	} );

	it( 'should show fallback error notification when form save fails without error message', async () => {
		const user = userEvent.setup();
		render( <GravatarProfileSection profile={ mockProfile } /> );

		// Make a change to enable the save button
		const displayNameInput = screen.getByDisplayValue( 'Test User' );
		await user.clear( displayNameInput );
		await user.type( displayNameInput, 'Updated User' );

		// Submit the form
		const saveButton = screen.getByRole( 'button', { name: 'Save' } );
		await user.click( saveButton );

		// Simulate failed mutation with empty error message
		await act( async () => {
			const mutateCall = mockMutate.mock.calls[ 0 ];
			const options = mutateCall[ 1 ];
			const error = new Error( '' );
			options.onError( error );
		} );

		// Verify error notification was called with fallback message
		expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
			'Failed to save public Gravatar profile.',
			{ type: 'snackbar' }
		);
	} );
} );
