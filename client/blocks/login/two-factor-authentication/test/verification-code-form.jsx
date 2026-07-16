/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerificationCodeForm from 'calypso/blocks/login/two-factor-authentication/verification-code-form';
import { loginUserWithTwoFactorVerificationCode } from 'calypso/state/login/actions';
import loginReducer from 'calypso/state/login/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/state/login/actions', () => ( {
	formUpdate: () => ( { type: 'TEST_FORM_UPDATE' } ),
	sendSmsCode: () => () => Promise.resolve(),
	loginUserWithTwoFactorVerificationCode: jest.fn( () => () => Promise.resolve() ),
} ) );

const render = ( el, initialState ) =>
	renderWithProvider( el, { reducers: { login: loginReducer }, initialState } );

// A security-key fallback login: the backend has emailed a code AND offers backup codes, so both
// nonces are present at once.
const stateWithEmailAndBackup = {
	login: {
		twoFactorAuth: {
			user_id: 123,
			two_step_nonce_email: 'EMAIL_NONCE',
			two_step_nonce_backup: 'BACKUP_NONCE',
		},
	},
};

describe( 'VerificationCodeForm', () => {
	beforeEach( () => jest.clearAllMocks() );

	test( 'submits the backup auth type on the backup step even when an email code is pending', async () => {
		const user = userEvent.setup();
		render(
			<VerificationCodeForm
				twoFactorAuthType="backup"
				switchTwoFactorAuthType={ jest.fn() }
				onSuccess={ jest.fn() }
			/>,
			stateWithEmailAndBackup
		);

		// The backup step must show its own label, not the emailed-code label.
		expect( screen.getByLabelText( 'Backup code' ) ).toBeVisible();
		expect( screen.queryByLabelText( '9-Digit code' ) ).not.toBeInTheDocument();

		await user.type( screen.getByLabelText( 'Backup code' ), '12345678' );
		await user.click( screen.getByRole( 'button', { name: 'Continue with backup code' } ) );

		expect( loginUserWithTwoFactorVerificationCode ).toHaveBeenCalledWith( '12345678', 'backup' );
	} );

	test( 'submits the email auth type on the email step', async () => {
		const user = userEvent.setup();
		render(
			<VerificationCodeForm
				twoFactorAuthType="email"
				switchTwoFactorAuthType={ jest.fn() }
				onSuccess={ jest.fn() }
			/>,
			stateWithEmailAndBackup
		);

		await user.type( screen.getByLabelText( '9-Digit code' ), '123456789' );
		await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( loginUserWithTwoFactorVerificationCode ).toHaveBeenCalledWith( '123456789', 'email' );
	} );
} );
