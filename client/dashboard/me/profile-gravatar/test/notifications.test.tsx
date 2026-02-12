/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useDispatch } from '@wordpress/data';
import nock from 'nock';
import { render } from '../../../test-utils';
import { mockUserSettings } from '../../profile/__mocks__/user-settings';
import GravatarProfileSection from '../index';

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

jest.mock(
	'@automattic/api-queries',
	() => {
		// Use the real updateUserSettings from api-core so nock can intercept HTTP calls
		const { updateUserSettings } = jest.requireActual( '@automattic/api-core' );
		return {
			userSettingsQuery: jest.fn(),
			userSettingsMutation: jest.fn( () => ( {
				mutationFn: updateUserSettings,
			} ) ),
		};
	},
	{ virtual: true }
);

describe( 'GravatarProfileSection Notifications', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( useDispatch as jest.Mock ).mockReturnValue( {
			createSuccessNotice: mockCreateSuccessNotice,
			createErrorNotice: mockCreateErrorNotice,
		} );

		const { userSettingsQuery } = require( '@automattic/api-queries' );
		userSettingsQuery.mockReturnValue( {
			queryKey: [ 'me', 'settings' ],
			queryFn: () => Promise.resolve( mockUserSettings ),
		} );
	} );

	it( 'should show success notification when form is saved successfully', async () => {
		const user = userEvent.setup();
		render( <GravatarProfileSection /> );

		// Mock the POST HTTP request
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings' )
			.reply( 200, { display_name: 'Updated User' } );

		// Make a change to enable the save button
		const displayNameInput = await screen.findByDisplayValue( 'Test User' );
		await user.clear( displayNameInput );
		await user.type( displayNameInput, 'Updated User' );

		// Submit the form
		const saveButton = screen.getByRole( 'button', { name: 'Save' } );
		await user.click( saveButton );

		// Wait for success notification to be called
		await waitFor( () => {
			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Public Gravatar profile saved successfully.',
				{ type: 'snackbar' }
			);
		} );
	} );

	it( 'should show error notification when form save fails with error message', async () => {
		const user = userEvent.setup();
		render( <GravatarProfileSection /> );

		// Mock the POST HTTP request
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings' )
			.reply( 400, { message: 'Network error occurred' } );

		// Make a change to enable the save button
		const displayNameInput = await screen.findByDisplayValue( 'Test User' );
		await user.clear( displayNameInput );
		await user.type( displayNameInput, 'Updated User' );

		// Submit the form
		const saveButton = screen.getByRole( 'button', { name: 'Save' } );
		await user.click( saveButton );

		// Wait for error notification to be called
		await waitFor( () => {
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Network error occurred', {
				type: 'snackbar',
			} );
		} );
	} );

	it( 'should show error notification when form save fails with HTTP error', async () => {
		const user = userEvent.setup();
		render( <GravatarProfileSection /> );

		// Mock the POST HTTP request
		nock( 'https://public-api.wordpress.com' ).post( '/rest/v1.1/me/settings' ).reply( 500, {} );

		// Make a change to enable the save button
		const displayNameInput = await screen.findByDisplayValue( 'Test User' );
		await user.clear( displayNameInput );
		await user.type( displayNameInput, 'Updated User' );

		// Submit the form
		const saveButton = screen.getByRole( 'button', { name: 'Save' } );
		await user.click( saveButton );

		// Wait for error notification with HTTP status message to be called
		await waitFor( () => {
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'500 status code for "POST /rest/v1.1/me/settings"',
				{ type: 'snackbar' }
			);
		} );
	} );
} );
