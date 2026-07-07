import { useIsMutating, useMutation } from '@tanstack/react-query';
import {
	Button,
	Spinner,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { arrowRight, Icon, lockOutline, plus } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { getTld } from '../../helpers/get-tld';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
import { useDomainSearch } from '../../page/context';
import { BundlePrice, BundleTldChips, DomainSearchNotice, DomainSuggestionBadge } from '../../ui';
import type { BundleSuggestion } from '@automattic/api-core';

import './style.scss';

interface InlineBundleRowProps {
	/**
	 * The bundle for the added trigger domain, or null/undefined while it is
	 * being fetched or when no bundle applies.
	 */
	bundle: BundleSuggestion | null | undefined;
	/**
	 * True while the per-FQDN bundle is being fetched. Renders a loading row.
	 */
	isLoading: boolean;
}

/**
 * An inline bundle offer rendered directly beneath the suggestion row of a
 * trigger domain the user added to the cart. The line leads with the added
 * (primary) domain and then the companion extensions the bundle adds, priced as
 * the full bundle, and a "Get bundle" button adds every member via
 * `cart.onAddBundle`. Reuses the context-free `BundleTldChips` and `BundlePrice`
 * primitives so it stays visually consistent with the top bundle card.
 */
export const InlineBundleRow = ( { bundle, isLoading }: InlineBundleRowProps ) => {
	const { __ } = useI18n();
	const { cart, events } = useDomainSearch();
	const { mutationId, isCurrentMutation } = useIsCurrentMutation();
	const isMutating = !! useIsMutating();

	const {
		mutate: addBundleToCart,
		error: addBundleError,
		isPending: isAddingBundle,
	} = useMutation( {
		meta: { mutationId },
		mutationFn: async ( bundleToAdd: BundleSuggestion ) => {
			if ( ! cart.onAddBundle ) {
				return;
			}

			await cart.onAddBundle( bundleToAdd );
		},
		onSuccess: ( _result, bundleToAdd ) => {
			events.onBundleAddToCart( bundleToAdd );
		},
		networkMode: 'always',
		retry: false,
	} );

	if ( isLoading ) {
		return (
			<div className="inline-bundle-row inline-bundle-row--loading" role="listitem">
				<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
					<Spinner className="inline-bundle-row__spinner" />
					<Text variant="muted">{ __( 'Finding a bundle for your domain…' ) }</Text>
				</HStack>
			</div>
		);
	}

	if ( ! bundle || bundle.domains.length === 0 ) {
		return null;
	}

	const { bundle_price, bundle_cost, original_price, original_cost, discount_percent } = bundle;

	// The line leads with the added (primary) domain in full, then the companion
	// extensions the bundle adds: `thalasso.world + .info + .vip`.
	const primary =
		bundle.domains.find( ( domain ) => domain.role === 'primary' ) ?? bundle.domains[ 0 ];
	const companions = bundle.domains.filter( ( domain ) => domain.domain !== primary.domain );

	if ( companions.length === 0 ) {
		return null;
	}

	const companionTlds = companions.map( ( domain ) => getTld( domain.domain ) );

	const displayBundlePrice = String( bundle_cost ?? bundle_price );
	const displayOriginalPrice = String( original_cost ?? original_price );

	const isAddedToCart = bundle.domains.every( ( { domain } ) => cart.hasItem( domain ) );

	const errorMessage =
		isCurrentMutation && addBundleError
			? addBundleError.message ||
			  __( 'Sorry, we couldn’t add the bundle to your cart. Please try again.' )
			: undefined;

	return (
		<div className="inline-bundle-row" role="listitem">
			<HStack
				alignment="center"
				justify="space-between"
				spacing={ 4 }
				className="inline-bundle-row__content"
			>
				<VStack spacing={ 2 } className="inline-bundle-row__info">
					<HStack
						justify="flex-start"
						spacing={ 3 }
						expanded={ false }
						className="inline-bundle-row__heading"
					>
						<BundleTldChips
							leadLabel={ primary.domain }
							tlds={ companionTlds }
							size={ 20 }
							className="inline-bundle-row__tlds"
						/>
						<DomainSuggestionBadge variation="warning">
							{ sprintf(
								// translators: %(percent)d is the bundle discount percentage, e.g. 20.
								__( 'Bundle and save %(percent)d%%' ),
								{ percent: discount_percent }
							) }
						</DomainSuggestionBadge>
					</HStack>
					<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
						<Icon icon={ lockOutline } size={ 18 } className="inline-bundle-row__lock-icon" />
						<Text size={ 13 } variant="muted" className="inline-bundle-row__subline">
							{ __( 'Secure popular domain extensions and protect your brand' ) }
						</Text>
					</HStack>
				</VStack>

				<HStack
					alignment="center"
					justify="flex-end"
					spacing={ 4 }
					expanded={ false }
					className="inline-bundle-row__actions"
				>
					<BundlePrice
						originalPrice={ displayOriginalPrice }
						bundlePrice={ displayBundlePrice }
						renewalPrice={ displayOriginalPrice }
						size={ 20 }
						alignment="right"
					/>
					{ isAddedToCart ? (
						<Button
							className="inline-bundle-row__cta inline-bundle-row__cta--continue"
							isPressed
							aria-pressed="mixed"
							__next40pxDefaultSize
							icon={ arrowRight }
							label={ __( 'Continue' ) }
							disabled={ isMutating }
							onClick={ () => events.onContinue() }
						>
							{ __( 'Continue' ) }
						</Button>
					) : (
						<Button
							className="inline-bundle-row__cta"
							variant="secondary"
							icon={ plus }
							__next40pxDefaultSize
							isBusy={ isAddingBundle }
							disabled={ isMutating }
							onClick={ () => addBundleToCart( bundle ) }
						>
							{ __( 'Get bundle' ) }
						</Button>
					) }
				</HStack>
			</HStack>

			{ errorMessage && <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice> }
		</div>
	);
};
