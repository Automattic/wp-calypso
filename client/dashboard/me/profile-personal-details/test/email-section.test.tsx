/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { mockUserSettings } from '../../profile/__mocks__/user-settings';
import EmailSection from '../email-section';

jest.mock( 'email-validator', () => ( {
	validate: jest.fn(),
} ) );

const mockPendingUserData = {
	...mockUserSettings,
	user_email_change_pending: true,
	new_user_email: 'pending@example.com',
};

const defaultProps = {
	value: 'test@example.com',
	onChange: jest.fn(),
	disabled: false,
	userData: mockUserSettings,
};

const renderWithUserData = ( userData = mockUserSettings, props = defaultProps ) => {
	// Mock the API response for mutations
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, userData );

	const result = render( <EmailSection { ...props } userData={ userData } /> );

	return result;
};

describe( 'EmailSection', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();

		const emailValidator = require( 'email-validator' );
		emailValidator.validate.mockReturnValue( true );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'renders email input field', async () => {
		renderWithUserData();

		const emailInput = await screen.findByLabelText( 'Email address' );
		expect( emailInput ).toBeInTheDocument();
		expect( emailInput ).toHaveValue( 'test@example.com' );
		expect( emailInput ).toBeEnabled();
	} );

	it( 'disables input when email is pending verification', async () => {
		renderWithUserData( mockPendingUserData );

		const emailInput = await screen.findByLabelText( 'Email address' );
		expect( emailInput ).toBeDisabled();
		expect( screen.getByText( 'Your email has not been verified yet.' ) ).toBeInTheDocument();
	} );

	it( 'calls cancel function when cancel button is clicked', async () => {
		const user = userEvent.setup();
		renderWithUserData( mockPendingUserData );

		// Mock the cancel API endpoint
		const cancelScope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', { user_email_change_pending: false } )
			.reply( 200, { ...mockPendingUserData, user_email_change_pending: false } );

		const cancelButton = await screen.findByText( 'Cancel the pending email change.' );
		await user.click( cancelButton );

		await waitFor( () => {
			expect( cancelScope.isDone() ).toBe( true );
		} );
	} );

	it( 'calls onChange when input value changes', async () => {
		const mockOnChange = jest.fn();
		const user = userEvent.setup();
		renderWithUserData( mockUserSettings, { ...defaultProps, onChange: mockOnChange } );

		const emailInput = await screen.findByLabelText( 'Email address' );
		await user.type( emailInput, 'x' );

		expect( mockOnChange ).toHaveBeenCalled();
	} );
} );
