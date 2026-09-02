/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerificationCodeForm from 'calypso/blocks/login/two-factor-authentication/verification-code-form';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const mockRecordTracksEvent = jest.fn();
const mockLoginRejection = jest.fn();

// Mocking the leaf module also mocks what `calypso/state/login/actions` re-exports,
// which is what the form imports. The thunk lets the form await a rejection.
jest.mock( 'calypso/state/login/actions/login-user-with-two-factor-verification-code', () => ( {
	loginUserWithTwoFactorVerificationCode: () => () => mockLoginRejection(),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	...jest.requireActual( 'calypso/state/analytics/actions' ),
	recordTracksEventWithClientId: ( ...args ) => {
		mockRecordTracksEvent( ...args );
		return { type: 'TEST_RECORD_TRACKS_EVENT' };
	},
} ) );

const NONCE_MESSAGE = 'Your session has expired. Please log in again.';

const renderForm = () =>
	renderWithProvider(
		<VerificationCodeForm
			onSuccess={ () => {} }
			switchTwoFactorAuthType={ () => {} }
			twoFactorAuthType="authenticator"
		/>,
		{ reducers: { login: loginReducer } }
	);

/**
 * Fills in a code and submits, then waits for the rejection to be handled.
 */
const submitCode = async () => {
	await userEvent.type( screen.getByLabelText( 'Verification code' ), '123456' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

	await waitFor( () =>
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_login_two_factor_verification_code_failure',
			expect.anything()
		)
	);
};

describe( 'VerificationCodeForm', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'when the two-step nonce has expired', () => {
		beforeEach( () => {
			mockLoginRejection.mockRejectedValue( {
				code: 'invalid_two_step_nonce',
				message: NONCE_MESSAGE,
				field: 'global',
			} );
		} );

		test( 'leaves the code input disabled so it cannot be retried', async () => {
			renderForm();

			await submitCode();

			expect( screen.getByLabelText( 'Verification code' ) ).toBeDisabled();
			// The submit button is `accessibleWhenDisabled`, so it stays focusable and
			// reports its state through aria-disabled instead of the disabled attribute.
			expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toHaveAttribute(
				'aria-disabled',
				'true'
			);
		} );

		test( 'shows the server message with a way back to the login page', async () => {
			renderForm();

			await submitCode();

			expect( screen.getByText( NONCE_MESSAGE ) ).toBeInTheDocument();

			const exit = screen.getByRole( 'link', { name: 'Back to login' } );
			expect( exit ).toHaveAttribute( 'href', '/log-in' );
		} );

		test( 'still records the failure event with the code and message', async () => {
			renderForm();

			await submitCode();

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_login_two_factor_verification_code_failure',
				{ error_code: 'invalid_two_step_nonce', error_message: NONCE_MESSAGE }
			);
		} );
	} );

	describe( 'when the code itself is wrong', () => {
		beforeEach( () => {
			mockLoginRejection.mockRejectedValue( {
				code: 'invalid_two_step_code',
				message: 'That code is not valid.',
				field: 'twoStepCode',
			} );
		} );

		test( 're-enables the form for another attempt', async () => {
			renderForm();

			await submitCode();

			expect( screen.getByLabelText( 'Verification code' ) ).toBeEnabled();
			expect( screen.getByRole( 'button', { name: 'Continue' } ) ).not.toHaveAttribute(
				'aria-disabled',
				'true'
			);
		} );

		test( 'offers no way back to the login page', async () => {
			renderForm();

			await submitCode();

			expect( screen.queryByRole( 'link', { name: 'Back to login' } ) ).not.toBeInTheDocument();
		} );

		test( 'still records the failure event with the code and message', async () => {
			renderForm();

			await submitCode();

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_login_two_factor_verification_code_failure',
				{ error_code: 'invalid_two_step_code', error_message: 'That code is not valid.' }
			);
		} );
	} );
} );
