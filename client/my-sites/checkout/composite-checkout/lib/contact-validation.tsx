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
import React from 'react';
import { useDispatch } from 'react-redux';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import wp from 'calypso/lib/wp';
import {
	handleContactValidationResult,
	getSignupEmailValidationResult,
} from 'calypso/my-sites/checkout/composite-checkout/contact-validation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	isCompleteAndValid,
	areRequiredFieldsNotEmpty,
	prepareDomainContactValidationRequest,
	prepareGSuiteContactValidationRequest,
} from '../types/wpcom-store-state';
import getContactDetailsType from './get-contact-details-type';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { RequestCartProduct, ResponseCart } from '@automattic/shopping-cart';
import type {
	ManagedContactDetails,
	DomainContactValidationResponse,
	ContactDetailsType,
	ContactValidationRequestContactInformation,
} from '@automattic/wpcom-checkout';

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

export const validateContactDetailsAndDisplayErrors = async (
	contactInfo: ManagedContactDetails,
	isLoggedOutCart: boolean,
	activePaymentMethod: PaymentMethod | null,
	responseCart: ResponseCart,
	onEvent: ReturnType< typeof useEvents >,
	showErrorMessageBriefly: ( message: string ) => void,
	applyDomainContactValidationResults: () => void,
	clearDomainContactErrorMessages: () => void,
	reduxDispatch: ReturnType< typeof useDispatch >,
	translate: ReturnType< typeof useTranslate >
): Promise< boolean > => {
	const contactDetailsType = getContactDetailsType( responseCart );
	debug( 'validating contact details and reporting errors for', contactDetailsType );

	const completeValidationCheck = ( validationResult: unknown ) => {
		debug( 'validating contact details result', validationResult );
		handleContactValidationResult( {
			recordEvent: onEvent,
			showErrorMessage: showErrorMessageBriefly,
			paymentMethodId: activePaymentMethod?.id ?? '',
			validationResult,
			applyDomainContactValidationResults,
			clearDomainContactErrorMessages,
		} );
		return isContactValidationResponseValid( validationResult, contactInfo );
	};

	if ( isLoggedOutCart ) {
		const email = contactInfo.email?.value ?? '';
		const isSignupValidationValid = completeValidationCheck(
			await getSignupEmailValidationResult( email, ( newEmail: string ) =>
				getEmailTakenLoginRedirectMessage( newEmail, reduxDispatch, translate )
			)
		);
		if ( ! isSignupValidationValid ) {
			return false;
		}
	}

	switch ( contactDetailsType ) {
		case 'tax':
			return completeValidationCheck( await getTaxValidationResult( contactInfo ) );
		case 'domain':
			return completeValidationCheck(
				await getDomainValidationResult( responseCart.products, contactInfo )
			);
		case 'gsuite':
			return completeValidationCheck(
				await getGSuiteValidationResult( responseCart.products, contactInfo )
			);
		default:
			return isCompleteAndValid( contactInfo );
	}
};

export const validateContactDetails = async (
	contactInfo: ManagedContactDetails,
	isLoggedOutCart: boolean,
	responseCart: ResponseCart,
	reduxDispatch: ReturnType< typeof useDispatch >,
	translate: ReturnType< typeof useTranslate >
): Promise< boolean > => {
	debug( 'validating contact details without reporting errors' );
	const contactDetailsType = getContactDetailsType( responseCart );

	const completeValidationCheck = ( validationResult: unknown ) => {
		debug( 'validating contact details result', validationResult );
		return isContactValidationResponseValid( validationResult, contactInfo );
	};

	if ( isLoggedOutCart ) {
		const email = contactInfo.email?.value ?? '';
		const isSignupValidationValid = completeValidationCheck(
			await getSignupEmailValidationResult( email, ( newEmail: string ) =>
				getEmailTakenLoginRedirectMessage( newEmail, reduxDispatch, translate )
			)
		);
		if ( ! isSignupValidationValid ) {
			return false;
		}
	}

	switch ( contactDetailsType ) {
		case 'tax':
			return completeValidationCheck( await getTaxValidationResult( contactInfo ) );
		case 'domain':
			return completeValidationCheck(
				await getDomainValidationResult( responseCart.products, contactInfo )
			);
		case 'gsuite':
			return completeValidationCheck(
				await getGSuiteValidationResult( responseCart.products, contactInfo )
			);
		default:
			return isCompleteAndValid( contactInfo );
	}
};

function isContactValidationResponse( data: unknown ): data is DomainContactValidationResponse {
	const dataResponse = data as DomainContactValidationResponse;
	if ( dataResponse?.success !== false && dataResponse?.success !== true ) {
		return false;
	}
	return true;
}

export function isContactValidationResponseValid(
	data: unknown,
	contactDetails: ManagedContactDetails
): boolean {
	if ( ! isContactValidationResponse( data ) ) {
		return false;
	}
	return data.success && areRequiredFieldsNotEmpty( contactDetails );
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
const hydrateNestedObject = (
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

async function wpcomValidateTaxContactInformation(
	contactInformation: ContactValidationRequestContactInformation
): Promise< DomainContactValidationResponse > {
	return wp.req
		.post( { path: '/me/tax-contact-information/validate' }, undefined, {
			contact_information: contactInformation,
		} )
		.then( ( successData: unknown ) => {
			if ( ! isContactValidationResponse( successData ) ) {
				throw new Error( 'Contact validation returned unknown response.' );
			}

			if ( successData.messages ) {
				// Reshape the error messages to a nested object
				const formattedMessages = Object.keys( successData.messages ).reduce( ( obj, key ) => {
					const messages = ( successData.messages as Record< string, string[] > )[ key ];
					const fieldKeys = key.split( '.' );
					hydrateNestedObject( obj, fieldKeys, messages );
					return obj;
				}, {} );
				return {
					success: successData.success,
					messages: formattedMessages,
				};
			}

			return successData;
		} );
}

async function wpcomValidateDomainContactInformation(
	contactInformation: ContactValidationRequestContactInformation,
	domainNames: string[]
): Promise< DomainContactValidationResponse > {
	return wp.req.post(
		{ path: '/me/domain-contact-information/validate' },
		{
			apiVersion: '1.2',
		},
		{
			contact_information: contactInformation,
			domain_names: domainNames,
		}
	);
}

async function wpcomValidateGSuiteContactInformation(
	contactInformation: ContactValidationRequestContactInformation,
	domainNames: string[]
): Promise< DomainContactValidationResponse > {
	return wp.req.post( { path: '/me/google-apps/validate' }, undefined, {
		contact_information: contactInformation,
		domain_names: domainNames,
	} );
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
