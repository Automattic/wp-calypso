/**
 * External dependencies
 */
import { translate, TranslateResult } from 'i18n-calypso';
import { compact, get, isArray, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DAILY_PLAN_TO_REALTIME_PLAN,
	PRODUCTS_WITH_OPTIONS,
	OPTIONS_SLUG_MAP,
	UPGRADEABLE_WITH_NUDGE,
	UPSELL_PRODUCT_MATRIX,
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
import { getFeatureByKey, getFeatureCategoryByKey } from 'lib/plans/features-list';
import { JETPACK_PRODUCT_PRICE_MATRIX } from 'lib/products-values/constants';
import { Product, JETPACK_PRODUCTS_LIST, objectIsProduct } from 'lib/products-values/products-list';
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import { getJetpackProductTagline } from 'lib/products-values/get-jetpack-product-tagline';
import { getJetpackProductDescription } from 'lib/products-values/get-jetpack-product-description';
import { getJetpackProductShortName } from 'lib/products-values/get-jetpack-product-short-name';
import { PLAN_COMPARISON_PAGE } from 'my-sites/plans-v2/constants';

/**
 * Type dependencies
 */
import type {
	Duration,
	SelectorProduct,
	SelectorProductSlug,
	DurationString,
	SelectorProductFeaturesItem,
	SelectorProductFeaturesSection,
} from './types';
import type {
	JetpackRealtimePlan,
	JetpackPlanSlugs,
	Plan,
	JetpackPlanCardFeature,
} from 'lib/plans/types';
import type { JetpackProductSlug } from 'lib/products-values/types';
import type { SitePlan } from 'state/sites/selectors/get-site-plan';

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

export function productButtonLabel( product: SelectorProduct, isOwned: boolean ): TranslateResult {
	if ( isOwned ) {
		return product.type !== ITEM_TYPE_PRODUCT
			? translate( 'Manage Plan' )
			: translate( 'Manage Subscription' );
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
	isOwned: boolean,
	currentPlan?: SitePlan | null
): TranslateResult | undefined {
	if ( isOwned ) {
		return slugIsJetpackPlanSlug( product.productSlug )
			? translate( 'Your plan' )
			: translate( 'You own this' );
	}

	if ( currentPlan && planHasFeature( currentPlan, product.productSlug ) ) {
		return translate( 'Included in your plan' );
	}
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
			shortName: getJetpackProductShortName( item ) || '',
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
			features: {
				items: buildCardFeaturesFromItem( item ),
				more: {
					url: PLAN_COMPARISON_PAGE,
					label: translate( 'See all features' ),
				},
			},
			legacy: ! isResetPlan,
		};
	}
	return null;
}

/**
 * Builds a feature object of a product card, from a feature key.
 *
 * @param {JetpackPlanCardFeature} featureKey Key of the feature
 * @returns {SelectorProductFeaturesItem} Feature item
 */
export function buildCardFeatureItemFromFeatureKey(
	featureKey: JetpackPlanCardFeature
): SelectorProductFeaturesItem | undefined {
	let feature;
	let subFeaturesKeys;

	if ( isArray( featureKey ) ) {
		const [ key, subKeys ] = featureKey;

		feature = getFeatureByKey( key );
		subFeaturesKeys = subKeys;
	} else {
		feature = getFeatureByKey( featureKey );
	}

	if ( feature ) {
		return {
			icon: feature.getIcon?.(),
			text: feature.getTitle(),
			description: feature.getDescription?.(),
			subitems: subFeaturesKeys
				? compact( subFeaturesKeys.map( buildCardFeatureItemFromFeatureKey ) )
				: undefined,
		};
	}
}

/**
 * Builds the features object passed to the product card, from a plan or product.
 *
 * @param { Plan | Product} item Product or plan
 * @returns {SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[]} Features
 */
export function buildCardFeaturesFromItem(
	item: Plan | Product
): SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[] {
	if ( objectIsPlan( item ) ) {
		const features = item.getPlanCardFeatures?.();

		// Without sections
		if ( isArray( features ) ) {
			return compact( features.map( buildCardFeatureItemFromFeatureKey ) );
		}

		// With sections
		if ( isObject( features ) ) {
			const result = [] as SelectorProductFeaturesSection[];

			Object.getOwnPropertySymbols( features ).map( ( key ) => {
				const category = getFeatureCategoryByKey( key );
				const subfeatures = features[ key ];

				if ( category ) {
					result.push( {
						heading: category.getTitle(),
						list: subfeatures.map( buildCardFeatureItemFromFeatureKey ),
					} as SelectorProductFeaturesSection );
				}
			} );

			return compact( result );
		}
	}

	return [];
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
export function getRealtimeFromDaily( slug: string ): JetpackRealtimePlan | null {
	return DAILY_PLAN_TO_REALTIME_PLAN[ slug ];
}

/**
 * Returns whether an item is upgradeable by a nudge.
 *
 * @param slug string
 * @returns boolean | null
 */
export function isUpgradeable( slug: string ): boolean {
	return UPGRADEABLE_WITH_NUDGE.includes( slug );
}

/**
 * Returns an upsell product, if any, for the slug.
 *
 * @param slug string
 * @returns boolean | null
 */
export function getProductUpsell( slug: string ): string | null {
	return UPSELL_PRODUCT_MATRIX[ slug ];
}
