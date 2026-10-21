import { getVerificationCodeErrorMessage } from '../get-verification-code-error-message';

const translate = ( text ) => text;
const apiMessage =
	"Hmm, that's not a valid verification code. Please double-check your app and try again.";

describe( 'getVerificationCodeErrorMessage', () => {
	test( 'replaces the generic invalid-code message on the backup code form', () => {
		const error = { code: 'invalid_two_step_code', message: apiMessage, field: 'twoStepCode' };

		expect( getVerificationCodeErrorMessage( error, 'backup', translate ) ).toBe(
			'Hmm, that’s not a valid backup code. Please double-check your codes and try again.'
		);
	} );

	test.each( [ 'authenticator', 'sms', 'email' ] )(
		'keeps the API message for the %s form',
		( twoFactorAuthType ) => {
			const error = { code: 'invalid_two_step_code', message: apiMessage, field: 'twoStepCode' };

			expect( getVerificationCodeErrorMessage( error, twoFactorAuthType, translate ) ).toBe(
				apiMessage
			);
		}
	);

	test( 'keeps the API message for other error codes on the backup code form', () => {
		const error = {
			code: 'empty_two_step_code',
			message: 'Please enter a code.',
			field: 'twoStepCode',
		};

		expect( getVerificationCodeErrorMessage( error, 'backup', translate ) ).toBe(
			'Please enter a code.'
		);
	} );

	test( 'returns undefined when there is no error', () => {
		expect( getVerificationCodeErrorMessage( null, 'backup', translate ) ).toBeUndefined();
	} );
} );
