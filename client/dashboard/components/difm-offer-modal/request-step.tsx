import { difmOfferBuildRequestMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	TextControl,
	TextareaControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import { ButtonStack } from '../button-stack';
import Notice from '../notice';
import { Text } from '../text';
import type { DifmOfferBuildRequestVariation, DifmOfferSource, Site } from '@automattic/api-core';

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 5000;

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
	site,
	source,
	variation,
	productSlug,
	onSubmit,
	onRequestSent,
	onCancel,
}: {
	site: Site;
	source: DifmOfferSource;
	variation: DifmOfferBuildRequestVariation;
	productSlug: string;
	onSubmit: () => void;
	onRequestSent: () => void;
	onCancel: () => void;
} ) {
	const { user } = useAuth();
	const [ name, setName ] = useState( '' );
	const [ description, setDescription ] = useState( '' );
	const [ errorMessage, setErrorMessage ] = useState< string | null >( null );
	// After the build request succeeds, a retry adds the plan to the cart again but does
	// not send a second build request, so the request fields lock.
	const [ hasSentRequest, setHasSentRequest ] = useState( false );
	const [ isAddingToCart, setIsAddingToCart ] = useState( false );
	const buildRequest = useMutation( difmOfferBuildRequestMutation( site.ID ) );

	const isBusy = buildRequest.isPending || isAddingToCart;
	const canSubmit = description.trim() !== '' && ! isBusy;

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
			cancel_to: redirectToDashboardLink( { supportBackport: true } ),
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
			{ description: description.trim(), name: name.trim(), source, variation },
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
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				{ errorMessage && <Notice variant="error">{ errorMessage }</Notice> }
				<TextControl
					__next40pxDefaultSize
					label={ __( 'Email' ) }
					value={ user.email }
					readOnly
					onChange={ () => {} }
				/>
				<TextControl
					__next40pxDefaultSize
					label={ __( 'Site address' ) }
					value={ site.slug }
					readOnly
					onChange={ () => {} }
				/>
				<TextControl
					__next40pxDefaultSize
					label={ __( 'Name (optional)' ) }
					value={ name }
					maxLength={ NAME_MAX_LENGTH }
					readOnly={ hasSentRequest }
					onChange={ setName }
				/>
				<TextareaControl
					label={ __( 'Describe the site you want' ) }
					value={ description }
					maxLength={ DESCRIPTION_MAX_LENGTH }
					readOnly={ hasSentRequest }
					required
					onChange={ setDescription }
				/>
				<Text variant="muted">{ __( "We'll be in touch within one business day." ) }</Text>
				<ButtonStack justify="flex-end">
					<Button variant="tertiary" __next40pxDefaultSize onClick={ onCancel }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						type="submit"
						__next40pxDefaultSize
						isBusy={ isBusy }
						disabled={ ! canSubmit }
					>
						{ __( 'Send request' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}
