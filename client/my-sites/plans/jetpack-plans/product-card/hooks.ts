/**
 * External dependencies
 */
import { JETPACK_SEARCH_PRODUCTS, planHasFeature } from '@automattic/calypso-products';
import { numberFormat, TranslateResult, useTranslate } from 'i18n-calypso';
import { createElement, Fragment, useMemo } from 'react';

/**
 * Internal dependencies
 */
import type { SitePlan } from 'calypso/state/sites/selectors/get-site-plan';
import type { PriceTierEntry } from 'calypso/state/products-list/selectors/get-product-price-tiers';
import ExternalLink from 'calypso/components/external-link';
import { ITEM_TYPE_PRODUCT } from '../constants';

/**
 * Type dependencies
 */
import type { SelectorProduct, SiteProduct } from '../types';

export function useProductAboveButtonText(
	product: SelectorProduct,
	siteProduct?: SiteProduct,
	isOwned?: boolean,
	isIncludedInPlan?: boolean
): TranslateResult | null {
	const translate = useTranslate();

	return useMemo( () => {
		if (
			! isOwned &&
			! isIncludedInPlan &&
			siteProduct &&
			JETPACK_SEARCH_PRODUCTS.includes( product.productSlug )
		) {
			return translate( '*estimated price based off of %(records)s records', {
				args: {
					records: numberFormat( siteProduct.tierUsage, 0 ),
				},
				comment: 'records = number of records (posts, pages, etc) in a site',
			} );
		}

		return null;
	}, [ translate, isOwned, isIncludedInPlan, siteProduct, product ] );
}

export function useProductButtonLabel(
	product: SelectorProduct,
	isOwned: boolean,
	isUpgradeableToYearly: boolean,
	currentPlan?: SitePlan | null
): TranslateResult {
	const translate = useTranslate();

	return useMemo( () => {
		if ( isUpgradeableToYearly ) {
			return translate( 'Upgrade to Yearly' );
		}

		if (
			isOwned ||
			( currentPlan && planHasFeature( currentPlan.product_slug, product.productSlug ) )
		) {
			return product.type !== ITEM_TYPE_PRODUCT
				? translate( 'Manage Plan' )
				: translate( 'Manage Subscription' );
		}

		const { buttonLabel, displayName } = product;

		return (
			buttonLabel ??
			translate( 'Get {{name/}}', {
				components: {
					name: createElement( Fragment, {}, displayName ),
				},
				comment: '{{name/}} is the name of a product',
			} )
		);
	}, [ translate, isUpgradeableToYearly, isOwned, currentPlan, product ] );
}

/**
 * Gets tooltip for product.
 *
 * @param product Product to check.
 * @param tiers Product price tiers.
 */
export function useProductTooltip(
	product: SelectorProduct,
	tiers: PriceTierEntry[]
): null | TranslateResult {
	const translate = useTranslate();

	return useMemo( () => {
		if ( ! JETPACK_SEARCH_PRODUCTS.includes( product.productSlug ) ) {
			return null;
		}

		if ( tiers.length < 1 ) {
			return null;
		}

		const priceTier100 = getPriceTierForUnits( tiers, 1 );
		const priceTier1000 = getPriceTierForUnits( tiers, 101 );

		if ( ! priceTier100 || ! priceTier1000 ) {
			return null;
		}

		return translate(
			'{{p}}{{strong}}Pay only for what you need.{{/strong}}{{/p}}' +
				'{{p}}Up to 100 records %(price100)s{{br/}}' +
				'Up to 1,000 records %(price1000)s{{/p}}' +
				'{{Info}}More info{{/Info}}',
			{
				args: {
					price100: priceTier100.minimum_price_monthly_display,
					price1000: priceTier1000.minimum_price_monthly_display,
				},
				comment:
					'price100 = formatted price per 100 records, price1000 = formatted price per 1000 records. See https://jetpack.com/upgrade/search/.',
				components: {
					strong: createElement( 'strong' ),
					p: createElement( 'p' ),
					br: createElement( 'br' ),
					Info: createElement( ExternalLink, {
						icon: true,
						href: 'https://jetpack.com/upgrade/search/',
					} ),
				},
			}
		);
	}, [ translate, product, tiers ] );
}

function getPriceTierForUnits( tiers: PriceTierEntry[], units: number ): PriceTierEntry | null {
	const firstUnboundedTier = tiers.find( ( tier ) => ! tier.maximum_units );
	let matchingTier = tiers.find( ( tier ) => {
		if ( ! tier.maximum_units ) {
			return false;
		}
		if ( units >= tier.minimum_units && units <= tier.maximum_units ) {
			return true;
		}
		return false;
	} );
	if ( ! matchingTier && firstUnboundedTier && units >= firstUnboundedTier.minimum_units ) {
		matchingTier = firstUnboundedTier;
	}

	if ( ! matchingTier ) {
		return null;
	}
	return matchingTier;
}
