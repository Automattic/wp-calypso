/**
 * External dependencies
 */
import debugFactory from 'debug';
import {
	prepareDomainContactValidationRequest,
	prepareGSuiteContactValidationRequest,
	formatDomainContactValidationResponse,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	areRequiredFieldsNotEmpty,
} from 'my-sites/checkout/composite-checkout/wpcom';
import { translate } from 'i18n-calypso';

const debug = debugFactory( 'calypso:composite-checkout:contact-validation' );

export default function createContactValidationCallback( {
	type,
	validateContactFunction,
	recordEvent,
	showErrorMessage,
} ) {
	// Resolves to false if there are errors
	return async function contactValidationCallback(
		paymentMethodId,
		contactDetails,
		domainNames,
		applyDomainContactValidationResults
	) {
		const contact_information = prepareContactDetailsForValidation( type, contactDetails );
		try {
			debug( 'contact info validation for', contact_information, domainNames );
			const data = await validateContactFunction( contact_information, domainNames );
			debug( 'contact info validation result', data );
			handleContactValidationResult( {
				recordEvent,
				showErrorMessage,
				paymentMethodId,
				data,
				applyDomainContactValidationResults,
			} );
			return isContactValidationResponseValid( data, contactDetails );
		} catch ( error ) {
			debug( 'contact info validation error:', error );
			showErrorMessage(
				translate(
					'There was an error validating your contact information. Please contact support.'
				)
			);
			return false;
		}
	};
}

function handleContactValidationResult( {
	recordEvent,
	showErrorMessage,
	paymentMethodId,
	data,
	applyDomainContactValidationResults,
} ) {
	recordEvent( {
		type: 'VALIDATE_DOMAIN_CONTACT_INFO',
		payload: {
			credits: null,
			payment_method: translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ),
		},
	} );
	if ( ! data ) {
		showErrorMessage(
			translate( 'There was an error validating your contact information. Please contact support.' )
		);
	}
	if ( data && data.messages ) {
		showErrorMessage(
			translate(
				'We could not validate your contact information. Please review and update all the highlighted fields.'
			)
		);
	}
	applyDomainContactValidationResults( formatDomainContactValidationResponse( data ?? {} ) );
}

function isContactValidationResponseValid( data, contactDetails ) {
	return data && data.success && areRequiredFieldsNotEmpty( contactDetails );
}

function prepareContactDetailsForValidation( type, contactDetails ) {
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
