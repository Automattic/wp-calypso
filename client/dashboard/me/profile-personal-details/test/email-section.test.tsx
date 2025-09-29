/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { mockUserSettings } from '../../profile/__mocks__/user-settings';
import EmailSection from '../email-section';

const mockCancelPendingEmail = jest.fn();

jest.mock( '@automattic/api-queries', () => ( {
	userSettingsQuery: jest.fn( () => ( {
		queryKey: [ 'me', 'settings' ],
		queryFn: jest.fn(),
	} ) ),
	cancelPendingEmailChangeMutation: jest.fn( () => ( {
		mutationFn: mockCancelPendingEmail,
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useSuspenseQuery: jest.fn(),
	useMutation: jest.fn(),
} ) );

jest.mock( 'email-validator', () => ( {
	validate: jest.fn(),
} ) );

const defaultProps = {
	value: 'test@example.com',
	onChange: jest.fn(),
	disabled: false,
};

const mockPendingUserData = {
	...mockUserSettings,
	user_email_change_pending: true,
	new_user_email: 'pending@example.com',
};

describe( 'EmailSection', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		const { useSuspenseQuery, useMutation } = require( '@tanstack/react-query' );
		const emailValidator = require( 'email-validator' );

		useSuspenseQuery.mockReturnValue( { data: mockUserSettings } );
		useMutation.mockReturnValue( { mutate: mockCancelPendingEmail, isPending: false } );
		emailValidator.validate.mockReturnValue( true );
	} );

	it( 'renders email input field', () => {
		render( <EmailSection { ...defaultProps } /> );

		const emailInput = screen.getByLabelText( 'Email address' );
		expect( emailInput ).toBeInTheDocument();
		expect( emailInput ).toHaveValue( 'test@example.com' );
		expect( emailInput ).toBeEnabled();
	} );

	it( 'disables input when email is pending verification', () => {
		const { useSuspenseQuery } = require( '@tanstack/react-query' );
		useSuspenseQuery.mockReturnValue( { data: mockPendingUserData } );

		render( <EmailSection { ...defaultProps } /> );

		expect( screen.getByLabelText( 'Email address' ) ).toBeDisabled();
		expect( screen.getByText( 'Your email has not been verified yet.' ) ).toBeInTheDocument();
	} );

	it( 'calls cancel function when cancel button is clicked', async () => {
		const { useSuspenseQuery } = require( '@tanstack/react-query' );
		useSuspenseQuery.mockReturnValue( { data: mockPendingUserData } );

		const user = userEvent.setup();
		render( <EmailSection { ...defaultProps } /> );

		await user.click( screen.getByText( 'Cancel the pending email change.' ) );

		expect( mockCancelPendingEmail ).toHaveBeenCalled();
	} );

	it( 'calls onChange when input value changes', async () => {
		const mockOnChange = jest.fn();
		const user = userEvent.setup();
		render( <EmailSection { ...defaultProps } onChange={ mockOnChange } /> );

		const emailInput = screen.getByLabelText( 'Email address' );
		await user.type( emailInput, 'x' );

		expect( mockOnChange ).toHaveBeenCalled();
	} );
} );
