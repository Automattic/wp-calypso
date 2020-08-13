/**
 * External dependencies
 */
import { translate, TranslateResult } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DAILY_PLAN_TO_REALTIME_PLAN,
	PRODUCTS_WITH_OPTIONS,
	OPTIONS_SLUG_MAP,
	UPGRADEABLE_WITH_NUDGE,
	ITEM_TYPE_PRODUCT,
	ITEM_TYPE_BUNDLE,
	ITEM_TYPE_PLAN,
} from './constants';
import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	TERM_BIENNIALLY,
	JETPACK_LEGACY_PLANS,
	JETPACK_RESET_PLANS,
	JETPACK_SECURITY_PLANS,
} from 'lib/plans/constants';
import { getPlan, getMonthlyPlanByYearly, planHasFeature } from 'lib/plans';
import { JETPACK_PRODUCT_PRICE_MATRIX } from 'lib/products-values/constants';
import { Product, JETPACK_PRODUCTS_LIST, objectIsProduct } from 'lib/products-values/products-list';
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import { getJetpackProductTagline } from 'lib/products-values/get-jetpack-product-tagline';
import { getJetpackProductDescription } from 'lib/products-values/get-jetpack-product-description';
import { getJetpackProductShortName } from 'lib/products-values/get-jetpack-product-short-name';

/**
 * Type dependencies
 */
import type {
	Duration,
	SelectorProduct,
	SelectorProductSlug,
	AvailableProductData,
	SelectorProductCost,
	DurationString,
} from './types';
import type {
	JetpackDailyPlan,
	JetpackRealtimePlan,
	JetpackPlanSlugs,
	Plan,
} from 'lib/plans/types';
import type { JetpackProductSlug } from 'lib/products-values/types';

/**
 * Duration utils.
 */

export function stringToDuration( duration?: string ): Duration | undefined {
	if ( duration === undefined ) {
		return undefined;
	}
	if ( duration === 'monthly' ) {
		return TERM_MONTHLY;
	}
	return TERM_ANNUALLY;
}

export function stringToDurationString( duration?: string ): DurationString {
	return duration !== 'monthly' ? 'annual' : 'monthly';
}

export function durationToString( duration: Duration ): DurationString {
	return duration === TERM_MONTHLY ? 'monthly' : 'annual';
}

export function durationToText( duration: Duration ): TranslateResult {
	return duration === TERM_MONTHLY
		? translate( 'per month, billed monthly' )
		: translate( 'per year' );
}

/**
 * Product UI utils.
 */

export function productButtonLabel( product: SelectorProduct ): TranslateResult {
	if ( product.owned ) {
		return slugIsJetpackPlanSlug( product.productSlug )
			? translate( 'Manage plan' )
			: translate( 'Manage subscription' );
	}

	return (
		product.buttonLabel ??
		translate( 'Get %s', {
			args: product.displayName,
			comment: '%s is the name of a product',
		} )
	);
}

export function productBadgeLabel(
	product: SelectorProduct,
	currentPlan?: string | null
): TranslateResult | undefined {
	if ( product.owned ) {
		return slugIsJetpackPlanSlug( product.productSlug )
			? translate( 'Your plan' )
			: translate( 'You own this' );
	}

	if ( currentPlan && planHasFeature( currentPlan, product.productSlug ) ) {
		return translate( 'Included in your plan' );
	}
}

export function getProductPrices(
	product: SelectorProduct,
	availableProducts: Record< string, AvailableProductData >
): SelectorProductCost {
	const availableProduct = availableProducts[ product.costProductSlug || product.productSlug ];
	// Return if not annual price.
	if ( product.term !== TERM_ANNUALLY || ! availableProduct || ! product.monthlyProductSlug ) {
		return {
			cost: get( availableProduct, 'cost', 0 ),
		};
	}

	const relatedAvailableProduct = availableProducts[ product.monthlyProductSlug ];
	return {
		discountCost: get( availableProduct, 'cost', 0 ),
		cost: get( relatedAvailableProduct, 'cost', 0 ) * 12,
	};
}

/**
 * Type guards.
 */

function slugIsSelectorProductSlug( slug: string ): slug is SelectorProductSlug {
	return PRODUCTS_WITH_OPTIONS.includes( slug as typeof PRODUCTS_WITH_OPTIONS[ number ] );
}
function slugIsJetpackProductSlug( slug: string ): slug is JetpackProductSlug {
	return slug in JETPACK_PRODUCTS_LIST;
}
function slugIsJetpackPlanSlug( slug: string ): slug is JetpackPlanSlugs {
	return [ ...JETPACK_LEGACY_PLANS, ...JETPACK_RESET_PLANS ].includes( slug );
}

/**
 * Product parsing and data normalization utils.
 */

export function slugToItem( slug: string ): Plan | Product | SelectorProduct | null {
	if ( slugIsSelectorProductSlug( slug ) ) {
		return OPTIONS_SLUG_MAP[ slug ];
	} else if ( slugIsJetpackProductSlug( slug ) ) {
		return JETPACK_PRODUCTS_LIST[ slug ];
	} else if ( slugIsJetpackPlanSlug( slug ) ) {
		return getPlan( slug ) as Plan;
	}
	return null;
}

function objectIsSelectorProduct( item: object ): item is SelectorProduct {
	const requiredKeys = [
		'productSlug',
		'iconSlug',
		'displayName',
		'tagline',
		'description',
		'term',
	];
	return requiredKeys.every( ( k ) => k in item );
}
function objectIsPlan( item: object ): item is Plan {
	const requiredKeys = [
		'group',
		'type',
		'term',
		'getBillingTimeFrame',
		'getTitle',
		'getDescription',
		'getProductId',
		'getStoreSlug',
	];
	return requiredKeys.every( ( k ) => k in item );
}

/**
 * Converts data from a product, plan, or selector product to selector product.
 *
 * @param item Product, Plan, or SelectorProduct.
 * @returns SelectorProduct
 */
export function itemToSelectorProduct(
	item: Plan | Product | SelectorProduct | object
): SelectorProduct | null {
	if ( objectIsSelectorProduct( item ) ) {
		return item;
	} else if ( objectIsProduct( item ) ) {
		let monthlyProductSlug = undefined;
		if (
			item.term === TERM_ANNUALLY &&
			Object.keys( JETPACK_PRODUCT_PRICE_MATRIX ).includes( item.product_slug )
		) {
			monthlyProductSlug =
				JETPACK_PRODUCT_PRICE_MATRIX[
					item.product_slug as keyof typeof JETPACK_PRODUCT_PRICE_MATRIX
				].relatedProduct;
		}
		return {
			productSlug: item.product_slug,
			iconSlug: `${ item.product_slug }_v2`,
			displayName: getJetpackProductDisplayName( item ),
			type: ITEM_TYPE_PRODUCT,
			subtypes: [],
			tagline: getJetpackProductTagline( item ),
			description: getJetpackProductDescription( item ),
			monthlyProductSlug,
			buttonLabel: translate( 'Get %s', {
				args: getJetpackProductShortName( item ),
				comment: '%s is the name of a product',
			} ),
			term: item.term,
			features: { items: [] },
		};
	} else if ( objectIsPlan( item ) ) {
		const productSlug = item.getStoreSlug();
		let monthlyProductSlug = undefined;
		if ( item.term === TERM_ANNUALLY ) {
			monthlyProductSlug = getMonthlyPlanByYearly( productSlug );
		}
		const isResetPlan = JETPACK_RESET_PLANS.includes( productSlug );
		const iconAppend = isResetPlan ? '_v2' : '';
		const type = JETPACK_SECURITY_PLANS.includes( productSlug ) ? ITEM_TYPE_BUNDLE : ITEM_TYPE_PLAN;
		return {
			productSlug,
			iconSlug: productSlug + iconAppend,
			displayName: item.getTitle(),
			type,
			subtypes: [],
			tagline: get( item, 'getTagline', () => '' )(),
			description: item.getDescription(),
			monthlyProductSlug,
			term: item.term === TERM_BIENNIALLY ? TERM_ANNUALLY : item.term,
			features: { items: [] },
			legacy: ! isResetPlan,
		};
	}
	return null;
}

/**
 * Converts an item slug to a SelectorProduct item type.
 *
 * @param slug string
 * @returns SelectorProduct | null
 */
export function slugToSelectorProduct( slug: string ): SelectorProduct | null {
	const item = slugToItem( slug );
	if ( ! item ) {
		return null;
	}
	return itemToSelectorProduct( item );
}

/**
 * Returns an item slug that represents the real-time version of a daily one.
 *
 * @param slug string
 * @returns string | null
 */
export function getRealtimeFromDaily( slug: JetpackDailyPlan ): JetpackRealtimePlan | null {
	return DAILY_PLAN_TO_REALTIME_PLAN[ slug ];
}

/**
 * Returns wheter an item is upgradeable by a nudge.
 *
 * @param slug string
 * @returns boolean | null
 */
export function isUpgradeable( slug: string ): boolean {
	return UPGRADEABLE_WITH_NUDGE.includes( slug );
}
