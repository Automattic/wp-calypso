/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { mockUserSettings } from '../../../profile/__mocks__/user-settings';
import EmailVerificationBanner from '../email-verification-banner';

const mockCreateErrorNotice = jest.fn();

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

const renderWithUserData = ( userData = mockUserSettings ) => {
	// Mock the API response
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, userData );

	const result = render( <EmailVerificationBanner /> );

	result.queryClient.setQueryData( [ 'me', 'settings' ], userData );

	return result;
};

describe( 'EmailVerificationBanner', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
		mockReplaceState.mockClear();

		Object.defineProperty( window, 'location', {
			value: { search: '', pathname: '/test' },
			writable: true,
		} );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'renders verification notice when email is pending', async () => {
		renderWithUserData( mockPendingUserData );

		await waitFor( () => {
			expect( screen.getByText( 'Verify your email' ) ).toBeInTheDocument();
		} );
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeInTheDocument();
	} );

	it( 'calls resend email when button is clicked', async () => {
		const user = userEvent.setup();
		renderWithUserData( mockPendingUserData );

		// Mock the resend email API endpoint
		const resendScope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/settings', { user_email: 'pending@example.com' } )
			.reply( 200, mockPendingUserData );

		const resendButton = await screen.findByRole( 'button', { name: 'Resend email' } );
		await user.click( resendButton );

		await waitFor( () => {
			expect( resendScope.isDone() ).toBe( true );
		} );
	} );

	it( 'does not render when pendingEmail is empty', async () => {
		const { container } = renderWithUserData( {
			...mockPendingUserData,
			new_user_email: '',
		} );

		await waitFor( () => {
			expect( container.firstChild ).toBeNull();
		} );
	} );

	it( 'shows error notice for failed verification', async () => {
		Object.defineProperty( window, 'location', {
			value: { search: '?new_email_result=0', pathname: '/test' },
			writable: true,
		} );

		renderWithUserData();

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

		renderWithUserData();

		await waitFor( () => {
			expect( screen.getByText( 'Email address updated' ) ).toBeInTheDocument();
		} );
	} );
} );
