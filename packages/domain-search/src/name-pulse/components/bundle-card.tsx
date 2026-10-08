import { useIsMutating, useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { arrowRight, Icon, lockOutline, plus, shield } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { Fragment, useEffect } from 'react';
import { getTld } from '../../helpers/get-tld';
import { DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE } from '../../page/constants';
import { useDomainSearch } from '../../page/context';
import { DomainSearchNotice } from '../../ui';
import type { BundleSuggestion } from '@automattic/api-core';

import './bundle-card.scss';

const isBundleUnavailableError = ( error: unknown ) =>
	typeof error === 'object' &&
	error !== null &&
	( error as { code?: unknown } ).code === DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE;

const splitDomain = ( domain: string ) => {
	const tld = getTld( domain );
	return { sld: tld ? domain.slice( 0, -( tld.length + 1 ) ) : domain, tld };
};

interface NamePulseBundleCardProps {
	bundle: BundleSuggestion;
	/** Under Top results the card spans the row, with the price beside the TLDs. */
	isWide?: boolean;
}

/**
 * The bundle offer with its add-to-cart flow. It mounts once per query, so a
 * failed add never follows the reader to another search.
 */
export const NamePulseBundleCard = ( { bundle, isWide = false }: NamePulseBundleCardProps ) => {
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

	const { domains, bundle_price, bundle_cost, original_price, original_cost, discount_percent } =
		bundle;
	const bundlePrice = String( bundle_cost ?? bundle_price );
	const originalPrice = String( original_cost ?? original_price );
	const isInCart = domains.every( ( { domain } ) => cart.hasItem( domain ) );

	return (
		<div className={ clsx( 'name-pulse-bundle-card', isWide && 'name-pulse-bundle-card--wide' ) }>
			<div className="name-pulse-bundle-card__header">
				<span className="name-pulse-bundle-card__title">
					<Icon icon={ lockOutline } size={ 20 } />
					{ __( 'Protect your brand' ) }
				</span>
				<Badge intent="low">
					{ sprintf(
						// translators: %(percent)d is the bundle discount percentage, e.g. 20.
						__( 'Bundle and save %(percent)d%%' ),
						{ percent: discount_percent }
					) }
				</Badge>
			</div>

			<div className="name-pulse-bundle-card__lineup">
				<p className="name-pulse-bundle-card__tlds">
					{ domains.map( ( { domain }, index ) => (
						<Fragment key={ domain }>
							{ index > 0 && (
								<span className="name-pulse-bundle-card__plus" aria-hidden="true">
									+
								</span>
							) }
							<span>.{ splitDomain( domain ).tld }</span>
						</Fragment>
					) ) }
				</p>
				<p className="name-pulse-bundle-card__domains">
					{ domains.map( ( { domain }, index ) => {
						const { sld, tld } = splitDomain( domain );
						return (
							<Fragment key={ domain }>
								{ index > 0 && ', ' }
								{ sld }
								{ tld && <span className="name-pulse-bundle-card__domain-tld">.{ tld }</span> }
							</Fragment>
						);
					} ) }
				</p>
			</div>

			{ domains.some( ( domain ) => domain.is_premium ) && (
				<p className="name-pulse-bundle-card__note">
					{ __(
						'Premium domains are subject to different pricing and may not be eligible for promotions.'
					) }
				</p>
			) }

			{ errorMessage && <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice> }

			<div className="name-pulse-bundle-card__offer">
				<div className="name-pulse-bundle-card__price">
					<p className="name-pulse-bundle-card__amounts">
						<s
							aria-label={ sprintf(
								// translators: %(price)s is the original price of the domain bundle.
								__( 'Original price: %(price)s' ),
								{ price: originalPrice }
							) }
						>
							{ originalPrice }
						</s>
						<span
							className="name-pulse-bundle-card__sale"
							aria-label={ sprintf(
								// translators: %(price)s is the discounted bundle price.
								__( 'Bundle price: %(price)s' ),
								{ price: bundlePrice }
							) }
						>
							{ bundlePrice }
						</span>
					</p>
					<p className="name-pulse-bundle-card__renewal">
						{ createInterpolateElement(
							sprintf(
								// translators: %(price)s is the renewal price of the domain bundle.
								__( 'For first year. <span>%(price)s/year renewal.</span>' ),
								{ price: originalPrice }
							),
							{ span: <span className="name-pulse-bundle-card__nowrap" /> }
						) }
					</p>
				</div>

				{ isInCart ? (
					<Button
						className="name-pulse-bundle-card__cta"
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
						className="name-pulse-bundle-card__cta"
						variant="secondary"
						icon={ plus }
						__next40pxDefaultSize
						isBusy={ isPending }
						disabled={ isMutating }
						onClick={ () => addBundleToCart() }
					>
						{ __( 'Get bundle' ) }
					</Button>
				) }
			</div>

			<p className="name-pulse-bundle-card__footer">
				<Icon icon={ shield } size={ 20 } />
				{ __( 'Claim popular domain extensions to avoid copycats' ) }
			</p>
		</div>
	);
};
