/**
 * External dependencies
 */
import {
	prepareDomainContactValidationRequest,
	prepareGSuiteContactValidationRequest,
	formatDomainContactValidationResponse,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	areRequiredFieldsNotEmpty,
} from 'my-sites/checkout/composite-checkout/wpcom';
import { translate } from 'i18n-calypso';

export function handleContactValidationResult( {
	recordEvent,
	showErrorMessage,
	paymentMethodId,
	validationResult,
	applyDomainContactValidationResults,
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
	applyDomainContactValidationResults(
		formatDomainContactValidationResponse( validationResult ?? {} )
	);
}

export function isContactValidationResponseValid( data, contactDetails ) {
	return data && data.success && areRequiredFieldsNotEmpty( contactDetails );
}

export function prepareContactDetailsForValidation( type, contactDetails ) {
	if ( type === 'domains' ) {
		const { contact_information } = prepareDomainContactValidationRequest( contactDetails );
		return contact_information;
	}
	if ( type === 'gsuite' ) {
		const { contact_information } = prepareGSuiteContactValidationRequest( contactDetails );
		return contact_information;
	}
	throw new Error( `Unknown validation type: ${ type }` );
}
