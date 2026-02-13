/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { render } from '../../../test-utils';
import AccountDeletionModal from '../account-deletion-modal';

const defaultProps = {
	onClose: jest.fn(),
	onConfirm: jest.fn(),
	username: 'testuser',
	isDeleting: false,
	siteCount: 2,
	purchases: [],
};

describe( 'AccountDeletionModal', () => {
	it( 'renders the alternatives screen by default', () => {
		render( <AccountDeletionModal { ...defaultProps } /> );

		// Check that the correct title is present
		expect( screen.getByText( 'Are you sure?' ) ).toBeInTheDocument();

		// Check that the ActionList and ActionItem components are present
		expect( document.querySelector( '.action-list' ) ).toBeInTheDocument();
		expect( document.querySelector( '.action-item' ) ).toBeInTheDocument();
	} );

	it( 'shows site-specific options only when user has sites', () => {
		render( <AccountDeletionModal { ...defaultProps } siteCount={ 0 } /> );

		expect( screen.queryByText( "Change your site's address" ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Delete a site' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Start a new site' ) ).toBeInTheDocument();
	} );

	it( 'transitions to confirmation screen when Continue is clicked', () => {
		render( <AccountDeletionModal { ...defaultProps } /> );

		fireEvent.click( screen.getByText( 'Continue' ) );

		expect( screen.getByText( 'Confirm account deletion' ) ).toBeInTheDocument();
		expect(
			screen.getByText(
				'Please type your username in the field below to confirm. Your account will then be gone forever.'
			)
		).toBeInTheDocument();
		expect( screen.getByLabelText( /Type your username to confirm/ ) ).toBeInTheDocument();
	} );

	it( 'enables delete button only when username is correctly typed', () => {
		render( <AccountDeletionModal { ...defaultProps } /> );

		// Go to confirmation screen
		fireEvent.click( screen.getByText( 'Continue' ) );

		const deleteButton = screen.getByText( 'Delete account' );
		const usernameInput = screen.getByLabelText( /Type your username to confirm/ );

		expect( deleteButton ).toBeDisabled();

		fireEvent.change( usernameInput, { target: { value: 'wrongusername' } } );
		expect( deleteButton ).toBeDisabled();

		fireEvent.change( usernameInput, { target: { value: 'testuser' } } );
		expect( deleteButton ).not.toBeDisabled();
	} );

	it( 'calls onClose when Cancel is clicked', () => {
		const onClose = jest.fn();
		render( <AccountDeletionModal { ...defaultProps } onClose={ onClose } /> );

		fireEvent.click( screen.getByText( 'Cancel' ) );

		expect( onClose ).toHaveBeenCalled();
	} );

	it( 'calls onConfirm when Delete account is clicked with correct username', () => {
		const onConfirm = jest.fn();
		render( <AccountDeletionModal { ...defaultProps } onConfirm={ onConfirm } /> );

		// Go to confirmation screen
		fireEvent.click( screen.getByText( 'Continue' ) );

		const usernameInput = screen.getByLabelText( /Type your username to confirm/ );
		fireEvent.change( usernameInput, { target: { value: 'testuser' } } );

		fireEvent.click( screen.getByText( 'Delete account' ) );

		expect( onConfirm ).toHaveBeenCalled();
	} );

	it( 'blocks deletion when user has active purchases', async () => {
		render(
			<AccountDeletionModal
				{ ...defaultProps }
				purchases={ [
					{
						expiry_status: 'active',
						product_slug: 'pro_plan',
						is_refundable: true,
						is_cancelable: true,
					},
				] }
			/>
		);

		await screen.findByText( 'You still have active purchases on your account.' );
		expect( screen.getByText( 'Manage purchases' ) ).toBeInTheDocument();
	} );
} );
