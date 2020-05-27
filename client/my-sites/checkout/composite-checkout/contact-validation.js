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
	validateDomainContact,
	recordEvent,
	showErrorMessage,
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

export function createGSuiteContactValidationCallback( {
	validateGSuiteContact,
	recordEvent,
	showErrorMessage,
} ) {
	return async function contactValidationCallback(
		paymentMethodId,
		contactDetails,
		domainNames,
		applyDomainContactValidationResults
	) {
		const { contact_information } = prepareGSuiteContactValidationRequest( contactDetails );
		try {
			debug( 'GSuite contact info validation for', contact_information, domainNames );
			recordEvent( {
				type: 'VALIDATE_DOMAIN_CONTACT_INFO',
				payload: {
					credits: null,
					payment_method: translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ),
				},
			} );
			const data = await validateGSuiteContact( contact_information, domainNames );
			debug( 'GSuite contact info validation result', data );
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
			applyDomainContactValidationResults( formatDomainContactValidationResponse( data ?? {} ) );
			return ! ( data && data.success && areRequiredFieldsNotEmpty( contactDetails ) );
		} catch ( error ) {
			debug( 'GSuite contact info validation error:', error );
			showErrorMessage(
				translate(
					'There was an error validating your contact information. Please contact support.'
				)
			);
			return true;
		}
	};
}
