import {
	getJetpackProductDisplayName,
	getJetpackProductTagline,
	getJetpackProductCallToAction,
	getJetpackProductDescription,
	getJetpackProductDisclaimer,
	getJetpackProductShortName,
	getMonthlyPlanByYearly,
	getPlan,
	getYearlyPlanByMonthly,
	JetpackPlanSlug,
	JetpackProductSlug,
	JETPACK_LEGACY_PLANS,
	JETPACK_PRODUCT_PRICE_MATRIX,
	JETPACK_RESET_PLANS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SITE_PRODUCTS_WITH_FEATURES,
	objectIsProduct,
	Plan,
	Product,
	PRODUCTS_LIST,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import buildCardFeaturesFromItem from './build-card-features-from-item';
import {
	EXTERNAL_PRODUCTS_LIST,
	EXTERNAL_PRODUCTS_SLUG_MAP,
	ITEM_TYPE_PRODUCT,
	ITEM_TYPE_PLAN,
} from './constants';
import { getForCurrentCROIteration } from './iterations';
import objectIsPlan from './object-is-plan';
import { SelectorProduct } from './types';

function slugIsJetpackProductSlug( slug: string ): slug is JetpackProductSlug {
	return slug in JETPACK_SITE_PRODUCTS_WITH_FEATURES;
}

function slugIsJetpackPlanSlug( slug: string ): slug is JetpackPlanSlug {
	return (
		[ ...JETPACK_LEGACY_PLANS, ...JETPACK_RESET_PLANS ] as ReadonlyArray< string >
	 ).includes( slug );
}

function objectIsSelectorProduct(
	item: Plan | Product | SelectorProduct | Record< string, unknown >
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

function slugToItem( slug: string ): Plan | Product | SelectorProduct | null | undefined {
	if ( EXTERNAL_PRODUCTS_LIST.includes( slug ) ) {
		return EXTERNAL_PRODUCTS_SLUG_MAP[ slug ]();
	}

	if ( slugIsJetpackProductSlug( slug ) ) {
		return ( JETPACK_SITE_PRODUCTS_WITH_FEATURES as Record< string, Product > )[ slug ];
	}

	if ( slugIsJetpackPlanSlug( slug ) ) {
		return getPlan( slug ) as Plan;
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
		let monthlyProductSlug;
		let yearlyProductSlug;
		if (
			item.term === TERM_ANNUALLY &&
			Object.keys( JETPACK_PRODUCT_PRICE_MATRIX ).includes( item.product_slug )
		) {
			monthlyProductSlug =
				JETPACK_PRODUCT_PRICE_MATRIX[
					item.product_slug as keyof typeof JETPACK_PRODUCT_PRICE_MATRIX
				].relatedProduct;
		} else if ( item.term === TERM_MONTHLY ) {
			yearlyProductSlug = PRODUCTS_LIST[ item.product_slug as JetpackProductSlug ].type;
		}

		// We do not support TERM_BIENNIALLY for Jetpack plans
		if ( item.term === TERM_BIENNIALLY ) {
			return null;
		}

		const iconSlug = `${ yearlyProductSlug || item.product_slug }_v2_dark`;

		return {
			productSlug: item.product_slug,
			// Using the same slug for any duration helps prevent unnecessary DOM updates
			iconSlug,
			displayName: getJetpackProductDisplayName( item ) ?? '',
			type: ITEM_TYPE_PRODUCT,
			shortName: getJetpackProductShortName( item ) || '',
			tagline: getJetpackProductTagline( item ) ?? '',
			description: getJetpackProductDescription( item ),
			buttonLabel: getJetpackProductCallToAction( item ),
			monthlyProductSlug,
			term: item.term,
			categories: item.categories,
			hidePrice: ( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes(
				item.product_slug
			),
			features: {
				items: buildCardFeaturesFromItem( item ),
			},
			disclaimer: getJetpackProductDisclaimer( item ),
		};
	}

	if ( objectIsPlan( item ) ) {
		const productSlug = item.getStoreSlug();
		let monthlyProductSlug;
		let yearlyProductSlug;
		if ( item.term === TERM_ANNUALLY ) {
			monthlyProductSlug = getMonthlyPlanByYearly( productSlug );
		} else if ( item.term === TERM_MONTHLY ) {
			yearlyProductSlug = getYearlyPlanByMonthly( productSlug );
		}
		const isResetPlan = ( JETPACK_RESET_PLANS as ReadonlyArray< string > ).includes( productSlug );
		const iconAppend = isResetPlan ? '_v2' : '';
		return {
			productSlug,
			// Using the same slug for any duration helps prevent unnecessary DOM updates
			iconSlug: ( yearlyProductSlug || productSlug ) + iconAppend,
			displayName: getForCurrentCROIteration( item.getTitle ) ?? '',
			type: ITEM_TYPE_PLAN,
			shortName: getForCurrentCROIteration( item.getTitle ) ?? '',
			tagline: getForCurrentCROIteration( item.getTagline ) || '',
			description: getForCurrentCROIteration( item.getDescription ),
			monthlyProductSlug,
			term: item.term === TERM_BIENNIALLY ? TERM_ANNUALLY : item.term,
			features: {
				items: buildCardFeaturesFromItem( item ),
			},
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
export default function slugToSelectorProduct( slug: string ): SelectorProduct | null {
	const item = slugToItem( slug );
	if ( ! item ) {
		return null;
	}

	return itemToSelectorProduct( item );
}
