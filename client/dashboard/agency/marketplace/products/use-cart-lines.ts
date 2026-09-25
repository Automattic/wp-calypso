import { useMemo } from 'react';
import { getProductCommissionPercentage } from '../../earn/referrals/lib/commissions';
import { isPressableHostingProduct } from '../hosting/lib/pressable-plans';
import { getEffectivePressableOwnership } from '../hosting/lib/pressable-products';
import { WPCOM_HOSTING_FAMILY_SLUG } from '../lib/wpcom-hosting';
import { useAgencyPressablePlan } from '../use-agency-pressable-plan';
import { useOwnedWpcomSites } from '../use-owned-wpcom-sites';
import { getProductPriceInfo, getWpcomTieredPrice } from './lib/product-pricing';
import type { TermPricing } from '../use-term-pricing';
import type { ProductPriceInfo } from './lib/product-pricing';
import type { ShoppingCartItem } from './use-shopping-cart';
import type { AgencyProduct } from '@automattic/api-core';

export interface CartLine {
	item: ShoppingCartItem;
	product: AgencyProduct;
	priceInfo: ProductPriceInfo;
	subtotal: number;
	commission: number;
}

/**
 * Prices the cart the way the Hosting and Products pages do, so every place
 * that shows it (the cart menu, the referral checkout summary) agrees: owned
 * WordPress.com sites raise the volume tier, and Pressable's introductory
 * price only applies to agencies without a plan.
 */
export function useCartLines( {
	items,
	products,
	term,
	isReferralMode,
}: {
	items: ShoppingCartItem[];
	products: AgencyProduct[];
	term: TermPricing;
	isReferralMode: boolean;
} ) {
	const { ownedSites: ownedWpcomSites, isReady: isOwnedSitesReady } = useOwnedWpcomSites();
	const { plan: pressablePlan, ownership: pressableOwnership } = useAgencyPressablePlan();
	const applyPressableIntroductoryPrice =
		isReferralMode ||
		getEffectivePressableOwnership( pressableOwnership, pressablePlan, isReferralMode ) !==
			'agency';

	const lines = useMemo(
		() =>
			items
				.map( ( item ): CartLine | null => {
					const product = products.find( ( candidate ) => candidate.slug === item.slug );
					if ( ! product ) {
						return null;
					}
					const applyIntroductoryPrice =
						! isPressableHostingProduct( product.family_slug ) || applyPressableIntroductoryPrice;
					const priceInfo = getProductPriceInfo( product, term, { applyIntroductoryPrice } );
					const subtotal =
						product.family_slug === WPCOM_HOSTING_FAMILY_SLUG
							? getWpcomTieredPrice( product, item.quantity, term, ownedWpcomSites ).discountedCost
							: priceInfo.price * item.quantity;
					return {
						item,
						product,
						priceInfo,
						subtotal,
						commission:
							subtotal * getProductCommissionPercentage( product.slug, product.family_slug ),
					};
				} )
				.filter( ( line ): line is CartLine => line !== null ),
		[ items, products, term, applyPressableIntroductoryPrice, ownedWpcomSites ]
	);

	// A WordPress.com line's price depends on the owned sites, so hold the
	// amounts until they are known rather than showing a total that then drops.
	const isTotalReady =
		isOwnedSitesReady ||
		! lines.some( ( { product } ) => product.family_slug === WPCOM_HOSTING_FAMILY_SLUG );

	const { total, commission } = lines.reduce(
		( sums, line ) => ( {
			total: sums.total + line.subtotal,
			commission: sums.commission + line.commission,
		} ),
		{ total: 0, commission: 0 }
	);

	return {
		lines,
		currency: lines[ 0 ]?.product.currency ?? 'USD',
		total,
		commission,
		isTotalReady,
		hasWpcomHostingPlan: lines.some(
			( { product } ) => product.family_slug === WPCOM_HOSTING_FAMILY_SLUG
		),
	};
}
