import { isEmpty } from 'lodash';
import wp from 'calypso/lib/wp';
import { getSignupValidationErrorResponse } from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';

const wpcom = wp.undocumented();

async function wpcomValidateSignupEmail( ...args ) {
	return wpcom.validateNewUser( ...args, null );
}

export async function getSignupEmailValidationResult( email, emailTakenLoginRedirect ) {
	const response = await wpcomValidateSignupEmail( {
		email,
		is_from_registrationless_checkout: true,
	} );
	const signupValidationErrorResponse = getSignupValidationErrorResponse(
		response,
		email,
		emailTakenLoginRedirect
	);

	if ( isEmpty( signupValidationErrorResponse ) ) {
		return response;
	}
	const validationResponse = {
		...response,
		messages: signupValidationErrorResponse,
	};
	return validationResponse;
}
