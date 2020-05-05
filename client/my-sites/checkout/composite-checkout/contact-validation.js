/**
 * External dependencies
 */
import debugFactory from 'debug';
import {
	prepareDomainContactValidationRequest,
	formatDomainContactValidationResponse,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	areRequiredFieldsNotEmpty,
} from 'my-sites/checkout/composite-checkout/wpcom';

const debug = debugFactory( 'calypso:composite-checkout:contact-validation' );

export default function createContactValidationCallback( {
	validateDomainContact,
	recordEvent,
	showErrorMessage,
	translate,
} ) {
	return function contactValidationCallback(
		paymentMethodId,
		contactDetails,
		domainNames,
		applyDomainContactValidationResults
	) {
		return new Promise( ( resolve ) => {
			const { contact_information, domain_names } = prepareDomainContactValidationRequest(
				domainNames,
				contactDetails
			);
			validateDomainContact(
				contact_information,
				domain_names,
				( httpErrors, data ) => {
					recordEvent( {
						type: 'VALIDATE_DOMAIN_CONTACT_INFO',
						payload: {
							credits: null,
							payment_method: translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ),
						},
					} );
					debug(
						'Domain contact info validation for domains',
						domainNames,
						'and contact info',
						contactDetails,
						'result:',
						data
					);
					if ( ! data ) {
						showErrorMessage(
							translate(
								'There was an error validating your contact information. Please contact support.'
							)
						);
					}
					if ( data && data.messages ) {
						showErrorMessage(
							translate(
								'We could not validate your contact information. Please review and update all the highlighted fields.'
							)
						);
					}
					applyDomainContactValidationResults(
						formatDomainContactValidationResponse( data ?? {} )
					);
					resolve( ! ( data && data.success && areRequiredFieldsNotEmpty( contactDetails ) ) );
				},
				{ apiVersion: '1.2' }
			);
		} );
	};
}
