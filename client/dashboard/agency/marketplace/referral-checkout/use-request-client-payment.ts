import {
	activeAgencyQuery,
	agencyPartnerDirectoryLogoMutation,
	createReferralMutation,
	referralsQuery,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import emailValidator from 'email-validator';
import { useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { isPressableAddonProduct } from '../hosting/lib/pressable-plans';
import { getTermProductId } from '../products/lib/checkout-url';
import { clearStoredCart } from '../products/use-shopping-cart';
import { useMarketplaceType } from '../use-marketplace-type';
import { hasActivePressablePlanForClient } from './lib/has-active-pressable-plan';
import { getInitialReferralLogo, getReferralLogoOption, getReferralLogoPayload } from './lib/logo';
import type { ReferralLogo } from './lib/logo';
import type { CartLine } from '../products/use-cart-lines';
import type { TermPricing } from '../use-term-pricing';
import type { DevSiteReferral } from './use-dev-site-referral';
import type { ReferralFlowType } from '@automattic/api-core';

interface Options {
	agencyId: number;
	lines: CartLine[];
	term: TermPricing;
	profileLogoUrl: string | null;
	lastReferralLogoUrl: string | null;
	/** Set when the lines are the plan of a development site, whose license the client takes over. */
	license?: DevSiteReferral;
}

interface ApiError {
	code?: string;
	message?: string;
}

// The copy runs after the network calls, when the browser may no longer allow it.
async function copyToClipboard( text: string ): Promise< boolean > {
	try {
		await navigator.clipboard.writeText( text );
		return true;
	} catch {
		return false;
	}
}

/**
 * The state and actions of the request-payment form: the client's email and
 * message, the logo choice, and the send / copy actions. Sending
 * creates the referral and returns to Referrals with the link in the URL.
 */
export function useRequestClientPayment( {
	agencyId,
	lines,
	term,
	profileLogoUrl,
	lastReferralLogoUrl,
	license,
}: Options ) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { recordTracksEvent } = useAnalytics();
	const { createErrorNotice } = useDispatch( noticesStore );
	const { updateMarketplaceType } = useMarketplaceType();

	const [ email, setEmail ] = useState( '' );
	const [ emailError, setEmailError ] = useState< string | null >( null );
	const [ message, setMessage ] = useState( '' );
	// Until the user picks one, the logo follows the agency's logos, which
	// arrive after the first render.
	const [ chosenLogo, setChosenLogo ] = useState< ReferralLogo | null >( null );
	const logo = useMemo(
		() => chosenLogo ?? getInitialReferralLogo( profileLogoUrl, lastReferralLogoUrl ),
		[ chosenLogo, profileLogoUrl, lastReferralLogoUrl ]
	);

	const { mutateAsync: uploadLogo, isPending: isUploadingLogo } = useMutation(
		agencyPartnerDirectoryLogoMutation( agencyId )
	);
	const { mutateAsync: createReferral, isPending: isCreating } = useMutation( {
		...createReferralMutation( agencyId ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: referralsQuery( agencyId ).queryKey } );
			// A custom logo becomes the agency's last referral logo.
			queryClient.invalidateQueries( { queryKey: activeAgencyQuery().queryKey } );
		},
	} );

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

	// A retry after a failed request reuses the upload of the same file.
	const uploadedLogoRef = useRef< { file: File; url: string } | null >( null );
	const getUploadedLogoUrl = async ( file: File ) => {
		if ( uploadedLogoRef.current?.file !== file ) {
			uploadedLogoRef.current = { file, url: ( await uploadLogo( file ) ).url };
		}
		return uploadedLogoRef.current.url;
	};

	// A development site's license names its own product; the saved term does not apply.
	const productIds = license
		? [ license.productId ]
		: lines.map( ( { product } ) => getTermProductId( product, term ) );

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
			{ term_pricing: term, logo_type: getReferralLogoOption( logo ) }
		);

		try {
			const uploadedUrl = logo.type === 'file' ? await getUploadedLogoUrl( logo.file ) : undefined;
			const referral = await createReferral( {
				client_email: email,
				client_message: message,
				product_ids: productIds.join( ',' ),
				...( license && {
					licenses: [ { product_id: license.productId, license_id: license.licenseId } ],
				} ),
				flow_type: flowType,
				logo: getReferralLogoPayload( logo, uploadedUrl ),
			} );
			// The link is copied for both flows.
			const isLinkCopied = await copyToClipboard( referral.checkout_url );
			// A development site's plan never went through the cart, which stays as it was.
			if ( ! license ) {
				clearStoredCart( 'referral' );
				updateMarketplaceType( 'regular' );
			}
			navigate( {
				to: '/referrals',
				search: {
					new_referral_order_email: email,
					new_referral_order_checkout_url: referral.checkout_url,
					flow_type: flowType,
					link_copied: isLinkCopied,
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

	return {
		email,
		emailError,
		message,
		logo,
		productIds,
		onEmailChange,
		onMessageChange: setMessage,
		onLogoChange: setChosenLogo,
		canSend: email !== '',
		canCopy: email !== '',
		isBusy: isSubmitting || isUploadingLogo || isCreating,
		send: () => runOnce( () => submit( 'send' ) ),
		copy: () => runOnce( () => submit( 'copy' ) ),
	};
}
