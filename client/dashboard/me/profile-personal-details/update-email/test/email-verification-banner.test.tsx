/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { mockUserSettings } from '../../../profile/__mocks__/user-settings';
import EmailVerificationBanner from '../email-verification-banner';

const mockResendEmail = jest.fn();
const mockCreateErrorNotice = jest.fn();

jest.mock( '@automattic/api-queries', () => ( {
	userSettingsQuery: jest.fn( () => ( {
		queryKey: [ 'me', 'settings' ],
		queryFn: jest.fn(),
	} ) ),
	resendEmailVerificationMutation: jest.fn( () => ( {
		mutationFn: mockResendEmail,
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	...jest.requireActual( '@tanstack/react-query' ),
	useSuspenseQuery: jest.fn(),
	useMutation: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createErrorNotice: mockCreateErrorNotice,
	} ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
	useSelect: jest.fn(),
	dispatch: jest.fn(),
} ) );

const mockReplaceState = jest.fn();
Object.defineProperty( window, 'history', {
	value: { replaceState: mockReplaceState },
	writable: true,
} );

const mockPendingUserData = {
	...mockUserSettings,
	user_email_change_pending: true,
	new_user_email: 'pending@example.com',
};

describe( 'EmailVerificationBanner', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockReplaceState.mockClear();

		Object.defineProperty( window, 'location', {
			value: { search: '', pathname: '/test' },
			writable: true,
		} );

		const { useSuspenseQuery, useMutation } = require( '@tanstack/react-query' );
		useSuspenseQuery.mockReturnValue( { data: mockUserSettings } );
		useMutation.mockReturnValue( { mutate: mockResendEmail, isPending: false } );
	} );

	it( 'renders verification notice when email is pending', () => {
		const { useSuspenseQuery } = require( '@tanstack/react-query' );
		useSuspenseQuery.mockReturnValue( { data: mockPendingUserData } );

		render( <EmailVerificationBanner /> );

		expect( screen.getByText( 'Verify your email' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeInTheDocument();
	} );

	it( 'calls resend email when button is clicked', async () => {
		const { useSuspenseQuery } = require( '@tanstack/react-query' );
		useSuspenseQuery.mockReturnValue( { data: mockPendingUserData } );

		const user = userEvent.setup();
		render( <EmailVerificationBanner /> );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		expect( mockResendEmail ).toHaveBeenCalledWith( 'pending@example.com' );
	} );

	it( 'does not render when pendingEmail is empty', () => {
		const { useSuspenseQuery } = require( '@tanstack/react-query' );
		useSuspenseQuery.mockReturnValue( {
			data: { ...mockPendingUserData, new_user_email: '' },
		} );

		const { container } = render( <EmailVerificationBanner /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'shows error notice for failed verification', async () => {
		Object.defineProperty( window, 'location', {
			value: { search: '?new_email_result=0', pathname: '/test' },
			writable: true,
		} );

		render( <EmailVerificationBanner /> );

		await waitFor( () => {
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'The email verification link is invalid or has expired. Please request a new one.',
				{ type: 'snackbar' }
			);
		} );
	} );

	it( 'shows success notice for successful verification', async () => {
		Object.defineProperty( window, 'location', {
			value: { search: '?new_email_result=1', pathname: '/test' },
			writable: true,
		} );

		render( <EmailVerificationBanner /> );

		await waitFor( () => {
			expect( screen.getByText( 'Email address updated' ) ).toBeInTheDocument();
		} );
	} );
} );
