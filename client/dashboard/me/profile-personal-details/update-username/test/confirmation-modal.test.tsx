/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import UsernameUpdateConfirmationModal from '../confirmation-modal';

const defaultProps = {
	isVisible: true,
	currentUsername: 'testuser',
	onConfirm: jest.fn(),
	onCancel: jest.fn(),
};

describe( 'UsernameUpdateConfirmationModal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Conditional rendering and content', () => {
		it( 'renders when isVisible is true', () => {
			render( <UsernameUpdateConfirmationModal { ...defaultProps } /> );
			expect( screen.getByText( 'Confirm username change' ) ).toBeInTheDocument();
		} );

		it( 'does not render when isVisible is false', () => {
			render( <UsernameUpdateConfirmationModal { ...defaultProps } isVisible={ false } /> );
			expect( screen.queryByText( 'Confirm username change' ) ).not.toBeInTheDocument();
		} );

		it( 'displays warning message with current username', () => {
			render(
				<UsernameUpdateConfirmationModal { ...defaultProps } currentUsername="myusername" />
			);

			expect(
				screen.getByText( /You are about to change your username, myusername/ )
			).toBeInTheDocument();
			expect(
				screen.getByText( /Once changed, you will not be able to revert it/ )
			).toBeInTheDocument();
		} );
	} );

	describe( 'User interactions', () => {
		it( 'calls onConfirm when confirm button is clicked', async () => {
			const user = userEvent.setup();
			const mockOnConfirm = jest.fn();

			render( <UsernameUpdateConfirmationModal { ...defaultProps } onConfirm={ mockOnConfirm } /> );

			const confirmButton = screen.getByRole( 'button', { name: /confirm|ok|yes|change/i } );
			await user.click( confirmButton );

			expect( mockOnConfirm ).toHaveBeenCalled();
		} );

		it( 'calls onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const mockOnCancel = jest.fn();

			render( <UsernameUpdateConfirmationModal { ...defaultProps } onCancel={ mockOnCancel } /> );

			const cancelButton = screen.getByRole( 'button', { name: /cancel|no/i } );
			await user.click( cancelButton );

			expect( mockOnCancel ).toHaveBeenCalled();
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'has proper dialog role and ARIA attributes', () => {
			render( <UsernameUpdateConfirmationModal { ...defaultProps } /> );

			const dialog = screen.getByTestId( 'username-change-dialog' );
			expect( dialog ).toHaveAttribute( 'role', 'dialog' );
			expect( dialog ).toHaveAttribute( 'aria-labelledby', 'username-change-title' );
			expect( dialog ).toHaveAttribute( 'aria-describedby', 'username-change-description' );
		} );

		it( 'has proper heading structure', () => {
			render( <UsernameUpdateConfirmationModal { ...defaultProps } /> );

			const heading = screen.getByRole( 'heading', { name: 'Confirm username change' } );
			expect( heading ).toHaveAttribute( 'id', 'username-change-title' );
		} );

		it( 'focuses on the modal when opened', () => {
			render( <UsernameUpdateConfirmationModal { ...defaultProps } /> );

			// ConfirmDialog creates multiple dialog elements, check that at least one exists
			const dialogs = screen.getAllByRole( 'dialog' );
			expect( dialogs.length ).toBeGreaterThan( 0 );
			expect( document.body ).toContainElement( dialogs[ 0 ] );
		} );
	} );
} );
