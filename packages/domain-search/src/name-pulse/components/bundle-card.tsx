import { useIsMutating, useMutation } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { BundleCard } from '../../components/bundle-card';
import { DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE } from '../../page/constants';
import { useDomainSearch } from '../../page/context';
import type { BundleSuggestion } from '@automattic/api-core';

const isBundleUnavailableError = ( error: unknown ) =>
	typeof error === 'object' &&
	error !== null &&
	( error as { code?: unknown } ).code === DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE;

/**
 * The classic results page's bundle card with its add-to-cart flow. It mounts
 * once per query, so a failed add never follows the reader to another search.
 */
export const NamePulseBundleCard = ( { bundle }: { bundle: BundleSuggestion } ) => {
	const { __ } = useI18n();
	const { cart, events } = useDomainSearch();
	const isMutating = !! useIsMutating();

	const {
		mutate: addBundleToCart,
		error,
		isPending,
	} = useMutation( {
		mutationFn: async () => {
			if ( ! cart.onAddBundle ) {
				return false;
			}

			await cart.onAddBundle( bundle );
			return true;
		},
		onSuccess: ( wasAdded ) => {
			if ( wasAdded ) {
				events.onBundleAddToCart( bundle, 'card' );
			}
		},
		networkMode: 'always',
		retry: false,
	} );

	useEffect( () => {
		events.onBundleShown( bundle, 'card' );
		// One event per bundle that appears, not one per render or `events` identity.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ bundle.bundle_group_id ] );

	let errorMessage: string | undefined;

	if ( isBundleUnavailableError( error ) ) {
		errorMessage = __(
			'This bundle is no longer available — one or more of the domains may have just been registered.'
		);
	} else if ( error ) {
		errorMessage =
			error.message || __( 'Sorry, we couldn’t add the bundle to your cart. Please try again.' );
	}

	return (
		<BundleCard
			suggestion={ bundle }
			onAddToCart={ () => addBundleToCart() }
			isAddedToCart={ bundle.domains.every( ( { domain } ) => cart.hasItem( domain ) ) }
			onContinue={ events.onContinue }
			isBusy={ isPending }
			disabled={ isMutating }
			errorMessage={ errorMessage }
		/>
	);
};
