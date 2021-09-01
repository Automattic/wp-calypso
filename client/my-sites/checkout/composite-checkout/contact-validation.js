import { translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import wp from 'calypso/lib/wp';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import {
	formatDomainContactValidationResponse,
	getSignupValidationErrorResponse,
} from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';

const wpcom = wp.undocumented();

async function wpcomValidateSignupEmail( ...args ) {
	return wpcom.validateNewUser( ...args, null );
}

export function handleContactValidationResult( {
	recordEvent,
	showErrorMessage,
	paymentMethodId,
	validationResult,
	applyDomainContactValidationResults,
	clearDomainContactErrorMessages,
} ) {
	recordEvent( {
		type: 'VALIDATE_DOMAIN_CONTACT_INFO',
		payload: {
			credits: null,
			payment_method: translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ),
		},
	} );

	if ( ! validationResult ) {
		showErrorMessage(
			translate( 'There was an error validating your contact information. Please contact support.' )
		);
	}
	if ( validationResult && validationResult.messages ) {
		showErrorMessage(
			translate(
				'We could not validate your contact information. Please review and update all the highlighted fields.'
			)
		);
	}
	if ( validationResult?.success ) {
		clearDomainContactErrorMessages();
	} else {
		applyDomainContactValidationResults(
			formatDomainContactValidationResponse( validationResult ?? {} )
		);
	}
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
