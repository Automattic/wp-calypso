import {
	getDomain,
	isDomainTransfer,
	isDomainProduct,
	isDomainMapping,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from '@automattic/calypso-products';
import { useEvents } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import wp from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	isCompleteAndValid,
	prepareDomainContactValidationRequest,
	prepareGSuiteContactValidationRequest,
	formatDomainContactValidationResponse,
	getSignupValidationErrorResponse,
} from '../types/wpcom-store-state';
import getContactDetailsType from './get-contact-details-type';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from './translate-payment-method-names';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { RequestCartProduct, ResponseCart } from '@automattic/shopping-cart';
import type {
	ManagedContactDetails,
	ManagedContactDetailsErrors,
	DomainContactValidationResponse,
	ContactDetailsType,
	ContactValidationRequestContactInformation,
	SignupValidationResponse,
	RawDomainContactValidationResponse,
	RawContactValidationResponseMessages,
	ContactValidationResponseMessages,
} from '@automattic/wpcom-checkout';
import type { TranslateResult } from 'i18n-calypso';

const debug = debugFactory( 'calypso:composite-checkout:contact-validation' );

const getEmailTakenLoginRedirectMessage = (
	emailAddress: string,
	reduxDispatch: ReturnType< typeof useDispatch >,
	translate: ReturnType< typeof useTranslate >
) => {
	const { href, pathname } = window.location;
	const isJetpackCheckout = pathname.includes( '/checkout/jetpack' );

	// Users with a WP.com account should return to the checkout page
	// once they are logged in to complete the process. The flow for them is
	// checkout -> login -> checkout.
	const currentURLQueryParameters = Object.fromEntries( new URL( href ).searchParams.entries() );
	const redirectTo = isJetpackCheckout
		? addQueryArgs( { ...currentURLQueryParameters, flow: 'coming_from_login' }, pathname )
		: '/checkout/no-site?cart=no-user';

	const loginUrl = login( { redirectTo, emailAddress } );

	reduxDispatch(
		recordTracksEvent( 'calypso_checkout_wpcom_email_exists', {
			email: emailAddress,
		} )
	);

	return translate(
		'That email address is already in use. If you have an existing account, {{a}}please log in{{/a}}.',
		{
			components: {
				a: (
					<a
						onClick={ () =>
							reduxDispatch(
								recordTracksEvent( 'calypso_checkout_composite_login_click', {
									email: emailAddress,
								} )
							)
						}
						href={ loginUrl }
					/>
				),
			},
		}
	);
};

async function runContactValidationCheck(
	contactInfo: ManagedContactDetails,
	responseCart: ResponseCart
): Promise< DomainContactValidationResponse > {
	const contactDetailsType = getContactDetailsType( responseCart );
	debug( 'validating contact details for', contactDetailsType );

	switch ( contactDetailsType ) {
		case 'tax':
			return getTaxValidationResult( contactInfo );
		case 'domain':
			return getDomainValidationResult( responseCart.products, contactInfo );
		case 'gsuite':
			return getGSuiteValidationResult( responseCart.products, contactInfo );
		default:
			return isCompleteAndValid( contactInfo ) ? { success: true } : { success: false };
	}
}

async function runLoggedOutEmailValidationCheck(
	contactInfo: ManagedContactDetails,
	reduxDispatch: ReturnType< typeof useDispatch >,
	translate: ReturnType< typeof useTranslate >
): Promise< unknown > {
	const email = contactInfo.email?.value ?? '';
	return getSignupEmailValidationResult( email, ( newEmail: string ) =>
		getEmailTakenLoginRedirectMessage( newEmail, reduxDispatch, translate )
	);
}

export async function validateContactDetails(
	contactInfo: ManagedContactDetails,
	isLoggedOutCart: boolean,
	activePaymentMethod: PaymentMethod | null,
	responseCart: ResponseCart,
	onEvent: ReturnType< typeof useEvents >,
	showErrorMessageBriefly: ( message: string ) => void,
	applyDomainContactValidationResults: ( results: ManagedContactDetailsErrors ) => void,
	clearDomainContactErrorMessages: () => void,
	reduxDispatch: ReturnType< typeof useDispatch >,
	translate: ReturnType< typeof useTranslate >,
	shouldDisplayErrors: boolean
): Promise< boolean > {
	debug( 'validating contact details; shouldDisplayErrors', shouldDisplayErrors );

	const completeValidationCheck = ( validationResult: unknown ): boolean => {
		debug( 'validating contact details result', validationResult );
		if ( shouldDisplayErrors ) {
			handleContactValidationResult( {
				translate,
				recordEvent: onEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod?.id ?? '',
				validationResult,
				applyDomainContactValidationResults,
				clearDomainContactErrorMessages,
			} );
		}
		return isContactValidationResponseValid( validationResult );
	};

	if ( isLoggedOutCart ) {
		const loggedOutValidationResult = await runLoggedOutEmailValidationCheck(
			contactInfo,
			reduxDispatch,
			translate
		);
		if ( shouldDisplayErrors ) {
			handleContactValidationResult( {
				translate,
				recordEvent: onEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod?.id ?? '',
				validationResult: loggedOutValidationResult,
				applyDomainContactValidationResults,
				clearDomainContactErrorMessages,
			} );
		}

		if ( ! isContactValidationResponseValid( loggedOutValidationResult ) ) {
			return false;
		}
	}

	return completeValidationCheck( await runContactValidationCheck( contactInfo, responseCart ) );
}

function isSignupValidationResponse( data: unknown ): data is SignupValidationResponse {
	const dataResponse = data as SignupValidationResponse;
	if ( dataResponse?.success !== false && dataResponse?.success !== true ) {
		return false;
	}
	return true;
}

function isContactValidationResponse( data: unknown ): data is DomainContactValidationResponse {
	const dataResponse = data as DomainContactValidationResponse;
	if ( dataResponse?.success !== false && dataResponse?.success !== true ) {
		return false;
	}
	return true;
}

export function isContactValidationResponseValid( data: unknown ): boolean {
	if ( ! isContactValidationResponse( data ) ) {
		throw new Error( 'Invalid contact validation response.' );
	}
	if ( ! data.success ) {
		debug( 'Validation response says that the contact details not valid' );
		return false;
	}
	return true;
}

function prepareContactDetailsForValidation(
	type: ContactDetailsType,
	contactDetails: ManagedContactDetails
): ContactValidationRequestContactInformation {
	if ( type === 'domain' || type === 'tax' ) {
		const { contact_information } = prepareDomainContactValidationRequest( contactDetails );
		return contact_information;
	}
	if ( type === 'gsuite' ) {
		const { contact_information } = prepareGSuiteContactValidationRequest( contactDetails );
		return contact_information;
	}
	throw new Error( `Unknown validation type: ${ type }` );
}

// https://stackoverflow.com/a/65072147/2615868
export const hydrateNestedObject = (
	obj: Record< string, unknown > | unknown = {},
	paths: string[] = [],
	value: unknown
): Record< string, unknown > => {
	const inputObj = obj === null ? {} : { ...( obj as Record< string, unknown > ) };

	if ( paths.length === 0 ) {
		return inputObj;
	}

	if ( paths.length === 1 ) {
		const path = paths[ 0 ];
		inputObj[ path ] = value;
		return { ...inputObj, [ path ]: value };
	}

	const [ path, ...rest ] = paths;
	const currentNode = inputObj[ path ];

	const childNode = hydrateNestedObject( currentNode, rest, value );

	return { ...inputObj, [ path ]: childNode };
};

async function wpcomValidateSignupEmail( {
	email,
	is_from_registrationless_checkout,
}: {
	email: string;
	is_from_registrationless_checkout: boolean;
} ): Promise< SignupValidationResponse > {
	return wp.req
		.post( '/signups/validation/user/', null, {
			locale: getLocaleSlug(),
			email,
			is_from_registrationless_checkout,
		} )
		.then( ( data: unknown ) => {
			if ( ! isSignupValidationResponse( data ) ) {
				throw new Error( 'Signup validation returned unknown response.' );
			}
			return data;
		} );
}

function convertValidationMessages(
	rawMessages: RawContactValidationResponseMessages
): ContactValidationResponseMessages {
	// Reshape the error messages to a nested object
	const formattedMessages = Object.keys( rawMessages ).reduce( ( obj, key ) => {
		const messages = rawMessages[ key as keyof typeof rawMessages ];
		const fieldKeys = key.split( '.' );
		return hydrateNestedObject( obj, fieldKeys, messages );
	}, {} );
	debug( 'Parsed validation error messages keys', rawMessages, 'into', formattedMessages );
	return formattedMessages;
}

function convertValidationResponse(
	rawResponse: RawDomainContactValidationResponse
): DomainContactValidationResponse {
	if ( ! isContactValidationResponse( rawResponse ) ) {
		throw new Error( 'Contact validation returned unknown response.' );
	}
	if ( rawResponse.messages ) {
		return {
			success: rawResponse.success,
			messages: convertValidationMessages( rawResponse.messages ),
		};
	}
	return rawResponse;
}

async function wpcomValidateTaxContactInformation(
	contactInformation: ContactValidationRequestContactInformation
): Promise< DomainContactValidationResponse > {
	return wp.req
		.post( { path: '/me/tax-contact-information/validate' }, undefined, {
			contact_information: contactInformation,
		} )
		.then( convertValidationResponse );
}

async function wpcomValidateDomainContactInformation(
	contactInformation: ContactValidationRequestContactInformation,
	domainNames: string[]
): Promise< DomainContactValidationResponse > {
	return wp.req
		.post(
			{ path: '/me/domain-contact-information/validate' },
			{
				apiVersion: '1.2',
			},
			{
				contact_information: contactInformation,
				domain_names: domainNames,
			}
		)
		.then( convertValidationResponse );
}

async function wpcomValidateGSuiteContactInformation(
	contactInformation: ContactValidationRequestContactInformation,
	domainNames: string[]
): Promise< DomainContactValidationResponse > {
	return wp.req
		.post( { path: '/me/google-apps/validate' }, undefined, {
			contact_information: contactInformation,
			domain_names: domainNames,
		} )
		.then( convertValidationResponse );
}

export async function getTaxValidationResult(
	contactInfo: ManagedContactDetails
): Promise< DomainContactValidationResponse > {
	const formattedContactDetails = prepareContactDetailsForValidation( 'tax', contactInfo );
	return wpcomValidateTaxContactInformation( formattedContactDetails );
}

async function getDomainValidationResult(
	products: RequestCartProduct[],
	contactInfo: ManagedContactDetails
): Promise< DomainContactValidationResponse > {
	const domainNames = products
		.filter( ( product ) => isDomainProduct( product ) || isDomainTransfer( product ) )
		.filter( ( product ) => ! isDomainMapping( product ) )
		.map( getDomain );
	const formattedContactDetails = prepareContactDetailsForValidation( 'domain', contactInfo );
	return wpcomValidateDomainContactInformation( formattedContactDetails, domainNames );
}

async function getGSuiteValidationResult(
	products: RequestCartProduct[],
	contactInfo: ManagedContactDetails
): Promise< DomainContactValidationResponse > {
	const domainNames = products
		.filter( ( item ) => isGSuiteOrGoogleWorkspaceProductSlug( item.product_slug ) )
		.map( getDomain );
	const formattedContactDetails = prepareContactDetailsForValidation( 'gsuite', contactInfo );
	return wpcomValidateGSuiteContactInformation( formattedContactDetails, domainNames );
}

function handleContactValidationResult( {
	translate,
	recordEvent,
	showErrorMessage,
	paymentMethodId,
	validationResult,
	applyDomainContactValidationResults,
	clearDomainContactErrorMessages,
}: {
	translate: ReturnType< typeof useTranslate >;
	recordEvent: ReturnType< typeof useEvents >;
	showErrorMessage: ( message: string ) => void;
	paymentMethodId: string;
	validationResult: unknown;
	applyDomainContactValidationResults: ( results: ManagedContactDetailsErrors ) => void;
	clearDomainContactErrorMessages: () => void;
} ) {
	if ( ! isContactValidationResponse( validationResult ) ) {
		return;
	}

	recordEvent( {
		type: 'VALIDATE_DOMAIN_CONTACT_INFO',
		payload: {
			credits: null,
			payment_method: translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ),
		},
	} );

	if ( ! validationResult ) {
		showErrorMessage(
			String(
				translate(
					'There was an error validating your contact information. Please contact support.'
				)
			)
		);
	}
	if ( validationResult && validationResult.messages ) {
		showErrorMessage(
			String(
				translate(
					'We could not validate your contact information. Please review and update all the highlighted fields.'
				)
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

async function getSignupEmailValidationResult(
	email: string,
	emailTakenLoginRedirect: ( email: string ) => TranslateResult
) {
	const response = await wpcomValidateSignupEmail( {
		email,
		is_from_registrationless_checkout: true,
	} );
	const signupValidationErrorResponse = getSignupValidationErrorResponse(
		response,
		email,
		emailTakenLoginRedirect
	);

	if ( Object.keys( signupValidationErrorResponse ).length === 0 ) {
		return response;
	}
	const validationResponse = {
		...response,
		messages: signupValidationErrorResponse,
	};
	return validationResponse;
}
