import {
	createReferralMutation,
	jetpackAgencyLicensesIssueMutation,
	referralsQuery,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import emailValidator from 'email-validator';
import { useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { isPressableAddonProduct } from '../hosting/lib/pressable-plans';
import { MARKETPLACE_PURCHASES_ROUTE } from '../paths';
import { getTermProductId } from '../products/lib/checkout-url';
import { clearStoredCart } from '../products/use-shopping-cart';
import { useMarketplaceType } from '../use-marketplace-type';
import { hasActivePressablePlanForClient } from './lib/has-active-pressable-plan';
import type { CartLine } from '../products/use-cart-lines';
import type { TermPricing } from '../use-term-pricing';
import type { ReferralFlowType } from '@automattic/api-core';

interface Options {
	agencyId: number;
	lines: CartLine[];
	term: TermPricing;
}

interface ApiError {
	code?: string;
	message?: string;
}

/**
 * The state and actions of the request-payment form: the client's email and
 * message, and the send / copy / purchase actions. Sending
 * creates the referral and returns to Referrals with the link in the URL.
 */
export function useRequestClientPayment( { agencyId, lines, term }: Options ) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice } = useDispatch( noticesStore );
	const { updateMarketplaceType } = useMarketplaceType();

	const [ email, setEmail ] = useState( '' );
	const [ emailError, setEmailError ] = useState< string | null >( null );
	const [ message, setMessage ] = useState( '' );
	const { mutateAsync: createReferral, isPending: isCreating } = useMutation(
		createReferralMutation( agencyId )
	);
	const { mutateAsync: issueLicenses, isPending: isIssuing } = useMutation(
		jetpackAgencyLicensesIssueMutation( agencyId )
	);

	const onEmailChange = ( value: string ) => {
		setEmail( value.trim() );
		setEmailError( null );
	};

	// One request at a time: the buttons only lock once React re-renders, and
	// checking the email can wait on the network.
	const isSubmittingRef = useRef( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const runOnce = async ( action: () => Promise< void > ) => {
		if ( isSubmittingRef.current ) {
			return;
		}
		isSubmittingRef.current = true;
		setIsSubmitting( true );
		try {
			await action();
		} finally {
			isSubmittingRef.current = false;
			setIsSubmitting( false );
		}
	};

	const productIds = lines.map( ( { product } ) => getTermProductId( product, term ) );

	const validate = async (): Promise< boolean > => {
		if ( ! emailValidator.validate( email ) ) {
			setEmailError( __( 'Please provide correct email address' ) );
			return false;
		}
		if ( ! lines.some( ( { product } ) => isPressableAddonProduct( product.slug ) ) ) {
			return true;
		}
		// A Pressable add-on attaches to a Pressable plan the client already has.
		try {
			const referrals = await queryClient.fetchQuery( referralsQuery( agencyId ) );
			if ( hasActivePressablePlanForClient( referrals, email ) ) {
				return true;
			}
		} catch {
			createErrorNotice(
				__( 'Failed to check whether this client has an active Pressable plan. Please try again.' ),
				{ type: 'snackbar' }
			);
			return false;
		}
		setEmailError(
			__(
				'This client does not have an active Pressable plan. An active Pressable plan is required to refer Pressable add-ons.'
			)
		);
		return false;
	};

	const submit = async ( flowType: ReferralFlowType ) => {
		if ( ! ( await validate() ) ) {
			return;
		}
		recordTracksEvent(
			flowType === 'send'
				? 'calypso_a4a_marketplace_referral_checkout_request_payment_click'
				: 'calypso_a4a_marketplace_referral_checkout_request_payment_copy_click',
			{ term_pricing: term }
		);

		try {
			const referral = await createReferral( {
				client_email: email,
				client_message: message,
				product_ids: productIds.join( ',' ),
				flow_type: flowType,
			} );
			// The link is copied for both flows.
			navigator.clipboard?.writeText( referral.checkout_url ).catch( () => undefined );
			clearStoredCart( 'referral' );
			updateMarketplaceType( 'regular' );
			navigate( {
				to: '/referrals',
				search: {
					new_referral_order_email: email,
					new_referral_order_checkout_url: referral.checkout_url,
					flow_type: flowType,
				},
			} );
		} catch ( error ) {
			const { code, message: errorMessage } = ( error ?? {} ) as ApiError;
			createErrorNotice(
				code === 'cannot_refer_to_client'
					? __(
							'Referring products to your own company is not allowed and against our terms of service.'
						)
					: errorMessage || __( 'Failed to submit referral.' ),
				{ type: 'snackbar' }
			);
		}
	};

	// A cart of free products needs no client: the licenses are issued to the agency.
	const purchase = async () => {
		recordTracksEvent( 'calypso_a4a_marketplace_referral_checkout_free_purchase_click', {
			term_pricing: term,
		} );
		try {
			for ( const { product, item } of lines ) {
				await issueLicenses( { product: product.slug, quantity: item.quantity } );
			}
			clearStoredCart( 'referral' );
			updateMarketplaceType( 'regular' );
			navigate( { to: MARKETPLACE_PURCHASES_ROUTE } );
		} catch ( error ) {
			createErrorNotice( ( error as ApiError )?.message || __( 'Failed to issue the licenses.' ), {
				type: 'snackbar',
			} );
		}
	};

	return {
		email,
		emailError,
		message,
		onEmailChange,
		onMessageChange: setMessage,
		canSend: email !== '',
		canCopy: email !== '',
		isBusy: isSubmitting || isCreating || isIssuing,
		send: () => runOnce( () => submit( 'send' ) ),
		copy: () => runOnce( () => submit( 'copy' ) ),
		purchase: () => runOnce( purchase ),
	};
}
