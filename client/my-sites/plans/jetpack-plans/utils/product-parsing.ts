/**
 * External dependencies
 */
import {
	getPlan,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	JetpackPlanSlugs,
	JETPACK_LEGACY_PLANS,
	JETPACK_RESET_PLANS,
	JETPACK_SECURITY_PLANS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCT_PRICE_MATRIX,
	Plan,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { createElement } from 'react';

/**
 * Internal dependencies
 */
import {
	JETPACK_PRODUCTS_LIST,
	objectIsProduct,
	Product,
	PRODUCTS_LIST,
} from 'calypso/lib/products-values/products-list';
import { getJetpackProductDisplayName } from 'calypso/lib/products-values/get-jetpack-product-display-name';
import { getJetpackProductTagline } from 'calypso/lib/products-values/get-jetpack-product-tagline';
import { getJetpackProductCallToAction } from 'calypso/lib/products-values/get-jetpack-product-call-to-action';
import { getJetpackProductDescription } from 'calypso/lib/products-values/get-jetpack-product-description';
import { getJetpackProductShortName } from 'calypso/lib/products-values/get-jetpack-product-short-name';
import {
	EXTERNAL_PRODUCTS_LIST,
	EXTERNAL_PRODUCTS_SLUG_MAP,
	ITEM_TYPE_BUNDLE,
	ITEM_TYPE_PLAN,
	ITEM_TYPE_PRODUCT,
	MORE_FEATURES_LINK,
	OPTIONS_SLUG_MAP,
	PRODUCTS_WITH_OPTIONS,
} from '../constants';
import { getForCurrentCROIteration, Iterations } from '../iterations';
import RecordsDetails from '../records-details';
import { buildCardFeaturesFromItem } from '../constants/features';
import objectIsPlan from './object-is-plan';

/**
 * Type dependencies
 */
import { JetpackProductSlug } from 'calypso/lib/products-values/types';
import { SelectorProduct, SelectorProductSlug } from '../types';

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

function slugToItem( slug: string ): Plan | Product | SelectorProduct | null | undefined {
	const isSelectorProductSlug = PRODUCTS_WITH_OPTIONS.includes(
		slug as typeof PRODUCTS_WITH_OPTIONS[ number ]
	);
	if ( isSelectorProductSlug ) {
		return getForCurrentCROIteration( ( variation: Iterations ) =>
			OPTIONS_SLUG_MAP[ slug as SelectorProductSlug ]( variation )
		);
	}

	if ( EXTERNAL_PRODUCTS_LIST.includes( slug ) ) {
		return getForCurrentCROIteration( ( variation: Iterations ) =>
			EXTERNAL_PRODUCTS_SLUG_MAP[ slug ]( variation )
		);
	}

	const isJetpackProductSlug = slug in JETPACK_PRODUCTS_LIST;
	if ( isJetpackProductSlug ) {
		return JETPACK_PRODUCTS_LIST[ slug as JetpackProductSlug ];
	}

	const isJetpackPlanSlug = [ ...JETPACK_LEGACY_PLANS, ...JETPACK_RESET_PLANS ].includes( slug );
	if ( isJetpackPlanSlug ) {
		return getPlan( slug as JetpackPlanSlugs ) as Plan;
	}

	return null;
}

/**
 * Converts data from a product, plan, or selector product to selector product.
 *
 * @param item Product, Plan, or SelectorProduct.
 * @returns SelectorProduct
 */
function itemToSelectorProduct(
	item: Plan | Product | SelectorProduct | Record< string, unknown >
): SelectorProduct | null {
	if ( objectIsSelectorProduct( item ) ) {
		return item;
	}

	if ( objectIsProduct( item ) ) {
		return productToSelectorProduct( item );
	}

	if ( objectIsPlan( item ) ) {
		return planToSelectorProduct( item );
	}

	return null;
}

function objectIsSelectorProduct(
	item: Record< string, unknown > | SelectorProduct
): item is SelectorProduct {
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

function productToSelectorProduct( item: Product ): SelectorProduct {
	let monthlyProductSlug;
	let yearlyProductSlug;
	if (
		item.term === TERM_ANNUALLY &&
		Object.keys( JETPACK_PRODUCT_PRICE_MATRIX ).includes( item.product_slug )
	) {
		monthlyProductSlug =
			JETPACK_PRODUCT_PRICE_MATRIX[ item.product_slug as keyof typeof JETPACK_PRODUCT_PRICE_MATRIX ]
				.relatedProduct;
	} else if ( item.term === TERM_MONTHLY ) {
		yearlyProductSlug = PRODUCTS_LIST[ item.product_slug as JetpackProductSlug ].type;
	}

	const iconSlug = `${ yearlyProductSlug || item.product_slug }_v2_dark`;

	return {
		productSlug: item.product_slug,
		// Using the same slug for any duration helps prevent unnecessary DOM updates
		iconSlug,
		displayName: getJetpackProductDisplayName( item ),
		type: ITEM_TYPE_PRODUCT,
		subtypes: [],
		shortName: getJetpackProductShortName( item ) || '',
		tagline: getJetpackProductTagline( item ),
		description: getJetpackProductDescription( item ),
		children: JETPACK_SEARCH_PRODUCTS.includes( item.product_slug )
			? createElement( RecordsDetails, { productSlug: item.product_slug } )
			: undefined,
		buttonLabel: getJetpackProductCallToAction( item ),
		monthlyProductSlug,
		term: item.term,
		hidePrice: JETPACK_SEARCH_PRODUCTS.includes( item.product_slug ),
		features: {
			items:
				getForCurrentCROIteration( ( variation: Iterations ) =>
					buildCardFeaturesFromItem(
						item,
						{
							withoutDescription: true,
							withoutIcon: true,
						},
						variation
					)
				) || [],
		},
	};
}

function planToSelectorProduct( item: Plan ): SelectorProduct {
	const productSlug = item.getStoreSlug();
	let monthlyProductSlug;
	let yearlyProductSlug;
	if ( item.term === TERM_ANNUALLY ) {
		monthlyProductSlug = getMonthlyPlanByYearly( productSlug );
	} else if ( item.term === TERM_MONTHLY ) {
		yearlyProductSlug = getYearlyPlanByMonthly( productSlug );
	}
	const isResetPlan = JETPACK_RESET_PLANS.includes( productSlug );
	const iconAppend = isResetPlan ? '_v2' : '';
	const type = JETPACK_SECURITY_PLANS.includes( productSlug ) ? ITEM_TYPE_BUNDLE : ITEM_TYPE_PLAN;
	return {
		productSlug,
		// Using the same slug for any duration helps prevent unnecessary DOM updates
		iconSlug: ( yearlyProductSlug || productSlug ) + iconAppend,
		displayName: getForCurrentCROIteration( item.getTitle ),
		buttonLabel: getForCurrentCROIteration( item.getButtonLabel ),
		type,
		subtypes: [],
		shortName: getForCurrentCROIteration( item.getTitle ),
		tagline: getForCurrentCROIteration( item.getTagline ) || '',
		description: getForCurrentCROIteration( item.getDescription ),
		monthlyProductSlug,
		term: item.term === TERM_BIENNIALLY ? TERM_ANNUALLY : item.term,
		features: {
			items:
				getForCurrentCROIteration( ( variation: Iterations ) =>
					buildCardFeaturesFromItem( item, undefined, variation )
				) || [],
			more: MORE_FEATURES_LINK,
		},
		legacy: ! isResetPlan,
	};
}
