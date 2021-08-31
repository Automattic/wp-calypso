import { useEvents } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import {
	handleContactValidationResult,
	isContactValidationResponseValid,
	getDomainValidationResult,
	getTaxValidationResult,
	getSignupEmailValidationResult,
	getGSuiteValidationResult,
} from 'calypso/my-sites/checkout/composite-checkout/contact-validation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isCompleteAndValid } from '../types/wpcom-store-state';
import getContactDetailsType from './get-contact-details-type';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

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
	debug( 'validating contact details and reporting errors' );
	const contactDetailsType = getContactDetailsType( responseCart );

	if ( isLoggedOutCart ) {
		const email = contactInfo.email?.value ?? '';
		const validationResult = await getSignupEmailValidationResult( email, ( email: string ) =>
			getEmailTakenLoginRedirectMessage( email, reduxDispatch, translate )
		);
		handleContactValidationResult( {
			recordEvent: onEvent,
			showErrorMessage: showErrorMessageBriefly,
			paymentMethodId: activePaymentMethod?.id ?? '',
			validationResult,
			applyDomainContactValidationResults,
			clearDomainContactErrorMessages,
		} );
		const isSignupValidationValid = isContactValidationResponseValid(
			validationResult,
			contactInfo
		);

		if ( ! isSignupValidationValid ) {
			return false;
		}
	}

	if ( contactDetailsType === 'tax' ) {
		const validationResult = await getTaxValidationResult( contactInfo );
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
	} else if ( contactDetailsType === 'domain' ) {
		const validationResult = await getDomainValidationResult( responseCart.products, contactInfo );
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
	} else if ( contactDetailsType === 'gsuite' ) {
		const validationResult = await getGSuiteValidationResult( responseCart.products, contactInfo );
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
	}
	return isCompleteAndValid( contactInfo );
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

	if ( isLoggedOutCart ) {
		const email = contactInfo.email?.value ?? '';
		const validationResult = await getSignupEmailValidationResult( email, ( email: string ) =>
			getEmailTakenLoginRedirectMessage( email, reduxDispatch, translate )
		);
		const isSignupValidationValid = isContactValidationResponseValid(
			validationResult,
			contactInfo
		);

		if ( ! isSignupValidationValid ) {
			return false;
		}
	}

	if ( contactDetailsType === 'tax' ) {
		const validationResult = await getTaxValidationResult( contactInfo );
		debug( 'validating contact details result', validationResult );
		return isContactValidationResponseValid( validationResult, contactInfo );
	} else if ( contactDetailsType === 'domain' ) {
		const validationResult = await getDomainValidationResult( responseCart.products, contactInfo );
		debug( 'validating contact details result', validationResult );
		return isContactValidationResponseValid( validationResult, contactInfo );
	} else if ( contactDetailsType === 'gsuite' ) {
		const validationResult = await getGSuiteValidationResult( responseCart.products, contactInfo );
		debug( 'validating contact details result', validationResult );
		return isContactValidationResponseValid( validationResult, contactInfo );
	}
	return isCompleteAndValid( contactInfo );
};
