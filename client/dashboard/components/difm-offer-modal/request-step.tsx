import { difmOfferBuildRequestMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	TextareaControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
import { getCurrentDashboard } from '../../app/routing';
import { dashboardLink, redirectToDashboardLink, wpcomLink } from '../../utils/link';
import Notice from '../notice';
import { Text } from '../text';
import { DIFM_OFFER_FAQ_URL } from './offer-step';
import type { DifmOfferBuildRequestVariation, DifmOfferSource, Site } from '@automattic/api-core';

const DESCRIPTION_MAX_LENGTH = 5000;

/**
 * The site overview opens the thank-you modal when it loads with this search param.
 */
export const DIFM_OFFER_PURCHASED_SEARCH = { difmOffer: 'purchased' } as const;

function getRequestErrorMessage( error: Error & { code?: string } ) {
	switch ( error.code ) {
		case 'rest_invalid_param':
			return __( 'Some of the details you entered are not valid. Check them and try again.' );
		case 'difm_offer_invalid_email':
			return __(
				'The email address on your account is not valid. Update it in your account settings and try again.'
			);
		case 'rest_forbidden':
			return __( 'Only an administrator of this site can request a site build.' );
		case 'difm_offer_ineligible':
			return __( 'This site is not eligible for this offer.' );
		case 'rate_limit_exceeded':
			return __( 'You have sent too many requests. Wait a few minutes and try again.' );
		case 'difm_offer_email_failed':
			return __( 'We could not send your request. Try again.' );
		default:
			return __( 'Something went wrong. Try again.' );
	}
}

export function RequestStep( {
	titleId,
	site,
	userEmail,
	source,
	variation,
	productSlug,
	cancelTo,
	onSubmit,
	onRequestSent,
	onBusyChange,
}: {
	titleId: string;
	site: Pick< Site, 'ID' | 'slug' >;
	userEmail: string;
	source: DifmOfferSource;
	variation: DifmOfferBuildRequestVariation;
	productSlug: string;
	cancelTo?: string;
	onSubmit: () => void;
	onRequestSent: () => void;
	onBusyChange: ( isBusy: boolean ) => void;
} ) {
	const [ description, setDescription ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState< string | null >( null );
	// After the build request succeeds, a retry adds the plan to the cart again but does
	// not send a second build request, so the description locks.
	const [ hasSentRequest, setHasSentRequest ] = useState( false );
	const [ isAddingToCart, setIsAddingToCart ] = useState( false );
	const buildRequest = useMutation( difmOfferBuildRequestMutation( site.ID ) );

	const isBusy = buildRequest.isPending || isAddingToCart;
	const canSubmit = description.trim() !== '' && ! isBusy;

	useEffect( () => {
		onBusyChange( isBusy );
	}, [ isBusy, onBusyChange ] );

	const addPlanToCartAndCheckout = async () => {
		setIsAddingToCart( true );
		try {
			const { shoppingCartManagerClient } = await import(
				/* webpackChunkName: "async-load-shopping-cart" */ '../../app/shopping-cart'
			);
			await shoppingCartManagerClient
				.forCartKey( site.ID )
				.actions.addProductsToCart( [
					{ product_slug: productSlug, extra: { difm_offer: true } },
				] );
		} catch ( error ) {
			setErrorMessage(
				sprintf(
					/* translators: %s is the error message from the shopping cart. */
					__( 'Your request was sent, but we could not add the plan to your cart. %s' ),
					( error as Error ).message || __( 'Try again.' )
				)
			);
			setIsAddingToCart( false );
			return;
		}

		// isAddingToCart stays true so the button stays busy until the page unloads.
		window.location.href = addQueryArgs( wpcomLink( `/checkout/${ site.slug }` ), {
			cancel_to: cancelTo ?? redirectToDashboardLink( { supportBackport: true } ),
			// Every entry point returns to the site overview, which thanks the user.
			redirect_to: addQueryArgs(
				dashboardLink( `/sites/${ site.slug }` ),
				DIFM_OFFER_PURCHASED_SEARCH
			),
			dashboard: getCurrentDashboard(),
		} );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( ! canSubmit ) {
			return;
		}
		onSubmit();
		setErrorMessage( null );

		if ( hasSentRequest ) {
			addPlanToCartAndCheckout();
			return;
		}

		buildRequest.mutate(
			{ description: description.trim(), source, variation },
			{
				onSuccess: () => {
					setHasSentRequest( true );
					onRequestSent();
					addPlanToCartAndCheckout();
				},
				onError: ( error: Error & { code?: string } ) =>
					setErrorMessage( getRequestErrorMessage( error ) ),
			}
		);
	};

	return (
		<form className="difm-offer-modal__body is-request-step" onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<VStack spacing={ 3 }>
					<Text id={ titleId } as="h1" size={ 20 } weight={ 600 } lineHeight="24px">
						{ __( 'Tell us about your site' ) }
					</Text>
					<Text>{ __( 'We’ll be in touch within 24 hours to go over your needs.' ) }</Text>
				</VStack>
				{ errorMessage && <Notice variant="error">{ errorMessage }</Notice> }
				<div className="difm-offer-modal__site-summary">
					<Text>
						{ createInterpolateElement(
							/* translators: <slug/> is the site address. */
							__( '<strong>Site:</strong> <slug/>' ),
							{ strong: <strong />, slug: <>{ site.slug }</> }
						) }
					</Text>
					<Text>
						{ createInterpolateElement(
							/* translators: <email/> is the email address of the user's account. */
							__( '<strong>Email:</strong> <email/>' ),
							{ strong: <strong />, email: <>{ userEmail }</> }
						) }
					</Text>
				</div>
				<TextareaControl
					label={ __( 'Site details' ) }
					value={ description }
					maxLength={ DESCRIPTION_MAX_LENGTH }
					readOnly={ hasSentRequest }
					required
					rows={ 5 }
					onChange={ setDescription }
				/>
			</VStack>
			<div className="difm-offer-modal__footer">
				<ExternalLink href={ DIFM_OFFER_FAQ_URL }>{ __( 'How it works' ) }</ExternalLink>
				<Button
					variant="primary"
					type="submit"
					__next40pxDefaultSize
					isBusy={ isBusy }
					disabled={ ! canSubmit }
				>
					{ __( 'Submit request' ) }
				</Button>
			</div>
		</form>
	);
}
