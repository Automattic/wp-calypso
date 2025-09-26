/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import UsernameUpdateConfirmationModal from '../confirmation-modal';

const defaultProps = {
	isOpen: true,
	currentUsername: 'testuser',
	onConfirm: jest.fn(),
	onCancel: jest.fn(),
	isBusy: false,
};

describe( 'UsernameUpdateConfirmationModal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Modal content', () => {
		it( 'displays warning message with current username', () => {
			render(
				<UsernameUpdateConfirmationModal { ...defaultProps } currentUsername="myusername" />
			);

			expect( screen.getByText( /You are about to change your username,/ ) ).toBeInTheDocument();
			expect( screen.getByText( /myusername/ ) ).toBeInTheDocument();
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
} );
