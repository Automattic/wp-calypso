import { useEvents } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import {
	handleContactValidationResult,
	getDomainValidationResult,
	getTaxValidationResult,
	getSignupEmailValidationResult,
	getGSuiteValidationResult,
} from 'calypso/my-sites/checkout/composite-checkout/contact-validation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isCompleteAndValid, areRequiredFieldsNotEmpty } from '../types/wpcom-store-state';
import getContactDetailsType from './get-contact-details-type';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type {
	ManagedContactDetails,
	DomainContactValidationResponse,
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
