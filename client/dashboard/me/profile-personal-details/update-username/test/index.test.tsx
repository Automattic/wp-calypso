/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import UsernameUpdateForm from '../index';
import {
	isUsernameValid,
	getUsernameValidationMessage,
	getAllowedActions,
} from '../username-validation-utils';

jest.mock( '../username-validation-utils', () => ( {
	isUsernameValid: jest.fn(),
	getUsernameValidationMessage: jest.fn(),
	getAllowedActions: jest.fn(),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	updateUsernameMutation: jest.fn( () => ( {
		mutationFn: jest.fn(),
	} ) ),
} ) );

const mockIsUsernameValid = isUsernameValid as jest.MockedFunction< typeof isUsernameValid >;
const mockGetUsernameValidationMessage = getUsernameValidationMessage as jest.MockedFunction<
	typeof getUsernameValidationMessage
>;
const mockGetAllowedActions = getAllowedActions as jest.MockedFunction< typeof getAllowedActions >;

const defaultProps = {
	hasUsernameChange: true,
	userLoginConfirm: '',
	usernameToConfirm: 'newusername',
	validationResult: null,
	usernameAction: 'none',
	onConfirmChange: jest.fn(),
	onActionChange: jest.fn(),
	onShowConfirmModal: jest.fn(),
	onCancel: jest.fn(),
	onValidationChange: jest.fn(),
};

describe( 'UsernameUpdateForm', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsUsernameValid.mockReturnValue( false );
		mockGetUsernameValidationMessage.mockReturnValue( null );
		mockGetAllowedActions.mockReturnValue( {} );
	} );

	describe( 'Username confirmation input', () => {
		it( 'renders confirmation input', () => {
			render( <UsernameUpdateForm { ...defaultProps } /> );

			const input = screen.getByLabelText( 'Confirm new username' );

			expect( input ).toBeInTheDocument();
		} );

		it( 'calls onConfirmChange when input value changes', async () => {
			const user = userEvent.setup();
			const mockOnConfirmChange = jest.fn();

			render( <UsernameUpdateForm { ...defaultProps } onConfirmChange={ mockOnConfirmChange } /> );

			const input = screen.getByLabelText( 'Confirm new username' );
			await user.type( input, 'test' );

			expect( mockOnConfirmChange ).toHaveBeenCalledWith( 't' );
			expect( mockOnConfirmChange ).toHaveBeenCalledWith( 'te' );
			expect( mockOnConfirmChange ).toHaveBeenCalledWith( 'tes' );
			expect( mockOnConfirmChange ).toHaveBeenCalledWith( 'test' );
		} );

		it( 'shows initial help text when input is empty', () => {
			render( <UsernameUpdateForm { ...defaultProps } /> );
			expect(
				screen.getByText( 'Please re-enter your new username to confirm it.' )
			).toBeInTheDocument();
		} );

		it( 'does not render when hasUsernameChange is false', () => {
			render( <UsernameUpdateForm { ...defaultProps } hasUsernameChange={ false } /> );
			expect( screen.queryByLabelText( 'Confirm new username' ) ).not.toBeInTheDocument();
		} );

		it( 'does not render when usernameToConfirm is undefined', () => {
			render( <UsernameUpdateForm { ...defaultProps } usernameToConfirm={ undefined } /> );
			expect( screen.queryByLabelText( 'Confirm new username' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Validation states', () => {
		it( 'shows error when usernames do not match', () => {
			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					userLoginConfirm="different"
					usernameToConfirm="newusername"
				/>
			);
			expect( screen.getByText( 'Usernames do not match.' ) ).toBeInTheDocument();
		} );

		it( 'shows validation error when usernames match but validation fails', () => {
			mockGetUsernameValidationMessage.mockReturnValue( 'Username is too short' );

			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					userLoginConfirm="newusername"
					usernameToConfirm="newusername"
					validationResult={ { error: 'invalid_input', message: 'Username is too short' } }
				/>
			);

			expect( screen.getByText( 'Username is too short' ) ).toBeInTheDocument();
		} );

		it( 'shows success message when usernames match and validation passes', () => {
			mockIsUsernameValid.mockReturnValue( true );

			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					userLoginConfirm="newusername"
					usernameToConfirm="newusername"
					validationResult={ { success: true } }
				/>
			);

			expect( screen.getByText( 'Thanks for confirming your new username!' ) ).toBeInTheDocument();
		} );

		it( 'applies error CSS class when there is an error', () => {
			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					userLoginConfirm="different"
					usernameToConfirm="newusername"
				/>
			);

			const input = screen.getByLabelText( 'Confirm new username' );
			const wrapper = input.closest( '.has-error' );
			expect( wrapper ).toBeInTheDocument();
			expect( input ).toHaveAttribute( 'aria-invalid', 'true' );
		} );
	} );

	describe( 'Radio control for blog actions', () => {
		it( 'renders radio control options', () => {
			mockGetAllowedActions.mockReturnValue( {
				none: 'No, just change my username',
				redirect: 'Yes, create a matching blog address',
			} );

			render( <UsernameUpdateForm { ...defaultProps } /> );

			expect(
				screen.getByText( 'Would you like a matching blog address too?' )
			).toBeInTheDocument();
			expect( screen.getByLabelText( 'No, just change my username' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'Yes, create a matching blog address' ) ).toBeInTheDocument();
		} );

		it( 'calls onActionChange when radio selection changes', async () => {
			const user = userEvent.setup();
			const mockOnActionChange = jest.fn();

			mockGetAllowedActions.mockReturnValue( {
				none: 'No, just change my username',
				redirect: 'Yes, create a matching blog address',
			} );

			render( <UsernameUpdateForm { ...defaultProps } onActionChange={ mockOnActionChange } /> );

			const redirectOption = screen.getByLabelText( 'Yes, create a matching blog address' );
			await user.click( redirectOption );

			expect( mockOnActionChange ).toHaveBeenCalledWith( 'redirect' );
		} );
	} );

	describe( 'Submit/cancel buttons', () => {
		it( 'renders change username and cancel buttons', () => {
			render( <UsernameUpdateForm { ...defaultProps } /> );

			expect( screen.getByRole( 'button', { name: 'Change username' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeInTheDocument();
		} );

		it( 'disables change username button when validation fails', () => {
			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					userLoginConfirm="different"
					usernameToConfirm="newusername"
				/>
			);

			const changeButton = screen.getByRole( 'button', { name: 'Change username' } );
			expect( changeButton ).toBeDisabled();
		} );

		it( 'enables change username button when validation passes', () => {
			mockIsUsernameValid.mockReturnValue( true );

			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					userLoginConfirm="newusername"
					usernameToConfirm="newusername"
					validationResult={ { success: true } }
				/>
			);

			const changeButton = screen.getByRole( 'button', { name: 'Change username' } );
			expect( changeButton ).toBeEnabled();
		} );

		it( 'calls onShowConfirmModal when change username button is clicked', async () => {
			const user = userEvent.setup();
			const mockOnShowConfirmModal = jest.fn();

			mockIsUsernameValid.mockReturnValue( true );

			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					userLoginConfirm="newusername"
					usernameToConfirm="newusername"
					validationResult={ { success: true } }
					onShowConfirmModal={ mockOnShowConfirmModal }
				/>
			);

			const changeButton = screen.getByRole( 'button', { name: 'Change username' } );
			await user.click( changeButton );

			expect( mockOnShowConfirmModal ).toHaveBeenCalled();
		} );

		it( 'calls onCancel and resets validation when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const mockOnCancel = jest.fn();
			const mockOnValidationChange = jest.fn();

			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					onCancel={ mockOnCancel }
					onValidationChange={ mockOnValidationChange }
				/>
			);

			const cancelButton = screen.getByRole( 'button', { name: 'Cancel' } );
			await user.click( cancelButton );

			expect( mockOnCancel ).toHaveBeenCalled();
			expect( mockOnValidationChange ).toHaveBeenCalledWith( null );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'has proper ARIA attributes', () => {
			render( <UsernameUpdateForm { ...defaultProps } /> );

			const input = screen.getByLabelText( 'Confirm new username' );
			expect( input ).toHaveAttribute( 'aria-describedby', 'username_confirm__help' );
		} );

		it( 'sets aria-invalid correctly based on error state', () => {
			render(
				<UsernameUpdateForm
					{ ...defaultProps }
					userLoginConfirm="different"
					usernameToConfirm="newusername"
				/>
			);

			const input = screen.getByLabelText( 'Confirm new username' );
			expect( input ).toHaveAttribute( 'aria-invalid', 'true' );
		} );
	} );
} );
