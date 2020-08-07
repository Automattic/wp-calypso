/**
 * External dependencies
 */
import { translate, TranslateResult } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { PRODUCTS_WITH_OPTIONS, OPTIONS_SLUG_MAP } from './constants';
import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	JETPACK_PLANS,
	JETPACK_RESET_PLANS,
	TERM_BIENNIALLY,
} from 'lib/plans/constants';
import { getPlan } from 'lib/plans';
import { Product, JETPACK_PRODUCTS_LIST, objectIsProduct } from 'lib/products-values/products-list';
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import { getJetpackProductTagline } from 'lib/products-values/get-jetpack-product-tagline';
import { getJetpackProductDescription } from 'lib/products-values/get-jetpack-product-description';

/**
 * Type dependencies
 */
import type { Duration, SelectorProduct, SelectorProductSlug } from './types';
import type { JetpackPlanSlugs, Plan } from 'lib/plans/types';
import type { JetpackProductSlug } from 'lib/products-values/types';

export function stringToDuration( duration?: string ): Duration | undefined {
	if ( duration === undefined ) {
		return undefined;
	}
	if ( duration === 'monthly' ) {
		return TERM_MONTHLY;
	}
	return TERM_ANNUALLY;
}

export function durationToText( duration: Duration ): TranslateResult {
	return duration === TERM_MONTHLY
		? translate( 'per month, billed monthly' )
		: translate( 'per year' );
}

function slugIsSelectorProductSlug( slug: string ): slug is SelectorProductSlug {
	return PRODUCTS_WITH_OPTIONS.includes( slug as typeof PRODUCTS_WITH_OPTIONS[ number ] );
}
function slugIsJetpackProductSlug( slug: string ): slug is JetpackProductSlug {
	return slug in JETPACK_PRODUCTS_LIST;
}
function slugIsJetpackPlanSlug( slug: string ): slug is JetpackPlanSlugs {
	return [ ...JETPACK_PLANS, JETPACK_RESET_PLANS ].includes( slug );
}

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
		return {
			productSlug: item.product_slug,
			iconSlug: '',
			displayName: getJetpackProductDisplayName( item ),
			tagline: getJetpackProductTagline( item ),
			description: getJetpackProductDescription( item ),
			term: item.term,
			features: [],
		};
	} else if ( objectIsPlan( item ) ) {
		return {
			productSlug: item.getStoreSlug(),
			iconSlug: '',
			displayName: item.getTitle(),
			tagline: get( item, 'getTagline', () => '' )(),
			description: item.getDescription(),
			term: item.term === TERM_BIENNIALLY ? TERM_ANNUALLY : item.term,
			features: [],
		};
	}
	return null;
}
