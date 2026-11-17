/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SecurityKeyForm from 'calypso/blocks/login/two-factor-authentication/security-key-form';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

const mockLoginUserWithSecurityKey = jest.fn();

// Mocking the leaf module also mocks what `calypso/state/login/actions` re-exports,
// which is what the form imports. The thunk lets the form await the result.
jest.mock( 'calypso/state/login/actions/login-user-with-security-key', () => ( {
	loginUserWithSecurityKey: () => () => mockLoginUserWithSecurityKey(),
} ) );

const renderForm = () =>
	renderWithProvider(
		<SecurityKeyForm onSuccess={ () => {} } switchTwoFactorAuthType={ () => {} } />,
		{ reducers: { login: loginReducer } }
	);

const getContinueButton = () =>
	screen.getByRole( 'button', { name: 'Continue with security key' } );

/**
 * The form starts a ceremony on mount. Wait until it has settled back to the idle
 * help text, which it shows whether the button ends up enabled or not.
 */
const waitForCeremonyToFail = () =>
	waitFor( () =>
		expect( screen.getByText( 'Use your security key to finish logging in.' ) ).toBeVisible()
	);

describe( 'SecurityKeyForm', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'when the two-step nonce has expired', () => {
		beforeEach( () => {
			mockLoginUserWithSecurityKey.mockRejectedValue( { code: 'invalid_two_step_nonce' } );
		} );

		test( 'stops offering a retry', async () => {
			renderForm();
			await waitForCeremonyToFail();

			expect( getContinueButton() ).toHaveAttribute( 'aria-disabled', 'true' );
			expect( screen.queryByText( 'Waiting for security key' ) ).not.toBeInTheDocument();
		} );

		test( 'does not start another ceremony when the button is clicked', async () => {
			renderForm();
			await waitForCeremonyToFail();

			await userEvent.click( getContinueButton() );

			expect( mockLoginUserWithSecurityKey ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'when the ceremony fails for another reason', () => {
		beforeEach( () => {
			mockLoginUserWithSecurityKey.mockRejectedValue( { code: 'NotAllowedError' } );
		} );

		test( 'lets the user try again', async () => {
			renderForm();
			await waitForCeremonyToFail();

			expect( getContinueButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );

			await userEvent.click( getContinueButton() );

			expect( mockLoginUserWithSecurityKey ).toHaveBeenCalledTimes( 2 );
		} );
	} );
} );
