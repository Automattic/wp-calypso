/**
 * External dependencies
 */
import debugFactory from 'debug';
import {
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	areRequiredFieldsNotEmpty,
} from '@automattic/composite-checkout-wpcom';

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
		applyDomainContactValidationResults,
		decoratedContactDetails
	) {
		return new Promise( resolve => {
			validateDomainContact( contactDetails, domainNames, ( httpErrors, data ) => {
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
					resolve( false );
					return;
				}
				if ( data.messages ) {
					showErrorMessage(
						translate(
							'We could not validate your contact information. Please review and update all the highlighted fields.'
						)
					);
				}
				applyDomainContactValidationResults( { ...data.messages } );
				resolve( ! ( data.success && areRequiredFieldsNotEmpty( decoratedContactDetails ) ) );
			} );
		} );
	};
}
