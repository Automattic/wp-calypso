import {
	getJetpackProductDisplayName,
	getJetpackProductTagline,
	getJetpackProductCallToAction,
	getJetpackProductDescription,
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
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	PRODUCTS_LIST,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import buildCardFeaturesFromItem from './build-card-features-from-item';
import {
	EXTERNAL_PRODUCTS_LIST,
	EXTERNAL_PRODUCTS_SLUG_MAP,
	ITEM_TYPE_PRODUCT,
	ITEM_TYPE_PLAN,
} from './constants';
import { getForCurrentCROIteration, Iterations } from './iterations';
import objectIsPlan from './object-is-plan';
import { SelectorProduct } from './types';

function slugIsJetpackProductSlug( slug: string ): slug is JetpackProductSlug {
	return slug in JETPACK_SITE_PRODUCTS_WITH_FEATURES;
}

function slugIsJetpackPlanSlug( slug: string ): slug is JetpackPlanSlug {
	return [ ...JETPACK_LEGACY_PLANS, ...JETPACK_RESET_PLANS ].includes( slug );
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

function slugToItem( slug: string ): Plan | Product | SelectorProduct | null | undefined {
	if ( EXTERNAL_PRODUCTS_LIST.includes( slug ) ) {
		return getForCurrentCROIteration( ( variation: Iterations ) =>
			EXTERNAL_PRODUCTS_SLUG_MAP[ slug ]( variation )
		);
	} else if ( slugIsJetpackProductSlug( slug ) ) {
		return JETPACK_SITE_PRODUCTS_WITH_FEATURES[ slug ];
	} else if ( slugIsJetpackPlanSlug( slug ) ) {
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
	} else if ( objectIsProduct( item ) ) {
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

		const isVideoPress =
			PRODUCT_JETPACK_VIDEOPRESS === item.product_slug ||
			PRODUCT_JETPACK_VIDEOPRESS_MONTHLY === item.product_slug;

		const iconSlug = `${ yearlyProductSlug || item.product_slug }_v2_dark`;

		return {
			productSlug: item.product_slug,
			// Using the same slug for any duration helps prevent unnecessary DOM updates
			iconSlug,
			displayName: getJetpackProductDisplayName( item ),
			type: ITEM_TYPE_PRODUCT,
			shortName: getJetpackProductShortName( item ) || '',
			tagline: getJetpackProductTagline( item ),
			description: getJetpackProductDescription( item ),
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
			// We need to hack VideoPress a bit as it has a free option.
			...( isVideoPress && {
				isFree: true,
				externalUrl: 'https://jetpack.com/features/design/video-hosting',
				belowPriceText: translate( 'from %(minPrice)s - %(maxPrice)s', {
					args: { minPrice: '$0', maxPrice: '$10' },
				} ),
			} ),
		};
	} else if ( objectIsPlan( item ) ) {
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
		return {
			productSlug,
			// Using the same slug for any duration helps prevent unnecessary DOM updates
			iconSlug: ( yearlyProductSlug || productSlug ) + iconAppend,
			displayName: getForCurrentCROIteration( item.getTitle ),
			type: ITEM_TYPE_PLAN,
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
