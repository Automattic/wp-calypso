/**
 * External dependencies
 */
import { translate, TranslateResult } from 'i18n-calypso';
import { difference } from 'lodash';

/**
 * Internal dependencies
 */
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import { getJetpackProductTagline } from 'lib/products-values/get-jetpack-product-tagline';
import { getJetpackProductDescription } from 'lib/products-values/get-jetpack-product-description';

/**
 * Type dependencies
 */
import type { Duration, SelectorProduct } from './types';
import type { Product } from 'lib/products-values/products-list';

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
export function rawItemToSelectorProduct( item: SelectorProduct | Product ): SelectorProduct {
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
