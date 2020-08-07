/**
 * External dependencies
 */
import { translate, TranslateResult } from 'i18n-calypso';
import { difference } from 'lodash';

/**
 * Internal dependencies
 */
import { PRODUCTS_WITH_OPTIONS, OPTIONS_SLUG_MAP } from './constants';
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';
import { Product, JETPACK_PRODUCTS_LIST } from 'lib/products-values/products-list';
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import { getJetpackProductTagline } from 'lib/products-values/get-jetpack-product-tagline';
import { getJetpackProductDescription } from 'lib/products-values/get-jetpack-product-description';

/**
 * Type dependencies
 */
import type { Duration, SelectorProduct, SelectorProductSlug } from './types';
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
	return slug in PRODUCTS_WITH_OPTIONS;
}
function slugIsJetpackProductSlug( slug: string ): slug is JetpackProductSlug {
	return slug in Object.keys( JETPACK_PRODUCTS_LIST );
}

export function slugToItem( slug: string ): SelectorProduct | Product | null {
	if ( slugIsSelectorProductSlug( slug ) ) {
		return OPTIONS_SLUG_MAP[ slug ];
	} else if ( slugIsJetpackProductSlug( slug ) ) {
		return JETPACK_PRODUCTS_LIST[ slug ];
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
	return difference( Object.keys( item ), requiredKeys ).length > 0;
}

/**
 * Converts data from a product, plan, or selector product to selector product.
 *
 * @param item Product, Plan, or SelectorProduct.
 * @returns SelectorProduct
 */
export function itemToSelectorProduct( item: SelectorProduct | Product ): SelectorProduct {
	if ( objectIsSelectorProduct( item ) ) {
		return item;
	}

	return {
		productSlug: item.product_slug,
		iconSlug: '',
		displayName: getJetpackProductDisplayName( item ),
		tagline: getJetpackProductTagline( item ),
		description: getJetpackProductDescription( item ),
		term: item.term,
		features: [],
	};
}
