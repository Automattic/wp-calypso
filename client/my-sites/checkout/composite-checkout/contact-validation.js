/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isLineItemADomain } from 'calypso/my-sites/checkout/composite-checkout/hooks/has-domains';
import { isGSuiteOrGoogleWorkspaceProductSlug } from 'calypso/lib/gsuite';
import {
	prepareDomainContactValidationRequest,
	prepareGSuiteContactValidationRequest,
	formatDomainContactValidationResponse,
	getSignupValidationErrorResponse,
	areRequiredFieldsNotEmpty,
} from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import wp from 'calypso/lib/wp';

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
async function wpcomValidateSignupEmail( ...args ) {
	return wpcom.validateNewUser( ...args, null );
}

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

export async function getDomainValidationResult( items, contactInfo ) {
	const domainNames = items
		.filter( isLineItemADomain )
		.map( ( domainItem ) => domainItem.wpcom_meta?.meta ?? '' );
	const formattedContactDetails = prepareContactDetailsForValidation( 'domains', contactInfo );
	return wpcomValidateDomainContactInformation( formattedContactDetails, domainNames );
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

export async function getGSuiteValidationResult( items, contactInfo ) {
	const domainNames = items
		.filter( ( item ) => isGSuiteOrGoogleWorkspaceProductSlug( item.wpcom_meta?.product_slug ) )
		.map( ( item ) => item.wpcom_meta?.meta ?? '' );
	const formattedContactDetails = prepareContactDetailsForValidation( 'gsuite', contactInfo );
	return wpcomValidateGSuiteContactInformation( formattedContactDetails, domainNames );
}
