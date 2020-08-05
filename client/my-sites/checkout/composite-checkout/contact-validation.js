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
import wp from 'lib/wp';

/**
 * Internal dependencies
 */
import { isLineItemADomain } from 'my-sites/checkout/composite-checkout/wpcom/hooks/has-domains';
import { isGSuiteProductSlug } from 'lib/gsuite';

const wpcom = wp.undocumented();

const wpcomValidateDomainContactInformation = ( ...args ) =>
	new Promise( ( resolve, reject ) => {
		// Promisify this function
		wpcom.validateDomainContactInformation(
			...args,
			( httpErrors, data ) => {
				if ( httpErrors ) {
					return reject( httpErrors );
				}
				resolve( data );
			},
			{ apiVersion: '1.2' }
		);
	} );

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcomValidateGSuiteContactInformation = ( ...args ) =>
	wpcom.validateGoogleAppsContactInformation( ...args );

export function handleContactValidationResult( {
	recordEvent,
	showErrorMessage,
	paymentMethodId,
	validationResult,
	applyDomainContactValidationResults,
	setshouldShowInvalidContactDetails,
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
		setshouldShowInvalidContactDetails( true );
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

export async function getDomainValidationResult( items, contactInfo ) {
	const domainNames = items
		.filter( isLineItemADomain )
		.map( ( domainItem ) => domainItem.wpcom_meta?.meta ?? '' );
	const formattedContactDetails = prepareContactDetailsForValidation( 'domains', contactInfo );
	return wpcomValidateDomainContactInformation( formattedContactDetails, domainNames );
}

export async function getGSuiteValidationResult( items, contactInfo ) {
	const domainNames = items
		.filter( ( item ) => isGSuiteProductSlug( item.wpcom_meta?.product_slug ) )
		.map( ( item ) => item.wpcom_meta?.meta ?? '' );
	const formattedContactDetails = prepareContactDetailsForValidation( 'gsuite', contactInfo );
	return wpcomValidateGSuiteContactInformation( formattedContactDetails, domainNames );
}
