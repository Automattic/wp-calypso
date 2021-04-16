/**
 * External dependencies
 */
import { translate, TranslateResult, numberFormat } from 'i18n-calypso';
import { compact, isObject } from 'lodash';
import page from 'page';
import React, { createElement, Fragment } from 'react';
import { createSelector } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { getFeatureByKey, getFeatureCategoryByKey } from 'calypso/lib/plans/features-list';
import {
	DAILY_PRODUCTS,
	EXTERNAL_PRODUCTS_LIST,
	EXTERNAL_PRODUCTS_SLUG_MAP,
	FEATURED_PRODUCTS,
	ITEM_TYPE_PRODUCT,
	ITEM_TYPE_BUNDLE,
	ITEM_TYPE_PLAN,
	OPTIONS_SLUG_MAP,
	PRODUCTS_WITH_OPTIONS,
	REALTIME_PRODUCTS,
	SUBTYPE_TO_OPTION,
} from './constants';
import RecordsDetails from './records-details';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	TERM_BIENNIALLY,
	JETPACK_LEGACY_PLANS,
	JETPACK_RESET_PLANS,
	JETPACK_SECURITY_PLANS,
	JETPACK_PLANS_BY_TERM,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCT_PRICE_MATRIX,
	JETPACK_PRODUCTS_BY_TERM,
} from '@automattic/calypso-products';
import {
	getPlan,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	planHasFeature,
	Product,
	JETPACK_PRODUCTS_LIST_WITH_FEATURES,
	objectIsProduct,
	PRODUCTS_LIST,
	getJetpackProductDisplayName,
	getJetpackProductTagline,
	getJetpackProductCallToAction,
	getJetpackProductDescription,
	getJetpackProductShortName,
} from '@automattic/calypso-products';
import config from '@automattic/calypso-config';
import { managePurchase } from 'calypso/me/purchases/paths';
import { getForCurrentCROIteration, Iterations } from './iterations';
import { MORE_FEATURES_LINK } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { addQueryArgs } from 'calypso/lib/route';
import { getProductCost } from 'calypso/state/products-list/selectors/get-product-cost';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';
import type {
	Duration,
	SelectorProduct,
	SelectorProductSlug,
	DurationString,
	SelectorProductFeaturesItem,
	SelectorProductFeaturesSection,
	QueryArgs,
	SiteProduct,
} from './types';
import type {
	JetpackPlanSlugs,
	Plan,
	JetpackPlanCardFeature,
	JetpackPlanCardFeatureSection,
} from '@automattic/calypso-products';
import type { JetpackProductSlug } from '@automattic/calypso-products';
import type { SitePlan } from 'calypso/state/sites/selectors/get-site-plan';
import ExternalLink from 'calypso/components/external-link';
import type { PriceTierEntry } from 'calypso/state/products-list/selectors/get-product-price-tiers';

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
	if ( duration === TERM_MONTHLY ) {
		return translate( '/month, paid monthly' );
	}

	return translate( '/month, paid yearly' );
}

// In the case of products that have options (daily and real-time), we want to display
// the name of the option, not the name of one of the variants.
export function getProductWithOptionDisplayName(
	item: SelectorProduct,
	isOwned: boolean,
	isItemPlanFeature: boolean
): TranslateResult {
	const optionSlug = getOptionFromSlug( item.productSlug );

	if ( ! optionSlug || isOwned || isItemPlanFeature ) {
		return item.displayName;
	}

	return slugToSelectorProduct( optionSlug )?.displayName || item.displayName;
}

// Takes any annual Jetpack product or plan slug and returns its corresponding monthly equivalent
function getMonthlySlugFromYearly( yearlySlug: string | null ) {
	const matchingProduct = JETPACK_PRODUCTS_BY_TERM.find(
		( product ) => product.yearly === yearlySlug
	);
	if ( matchingProduct ) {
		return matchingProduct.monthly;
	}

	const matchingPlan = JETPACK_PLANS_BY_TERM.find( ( plan ) => plan.yearly === yearlySlug );
	if ( matchingPlan ) {
		return matchingPlan.monthly;
	}

	return null;
}

/**
 * A selector that calculates the highest possible discount for annual billing purchases over monthly.
 *
 * @param {AppState} state The application state.
 * @param {string[]|null} annualProductSlugs A list of annually-billed product slugs to check for discounts
 * @returns {string|null} A formatted percentage representing the highest possible discount rounded to the nearest whole number, if one exists; otherwise, null.
 */
export const getHighestAnnualDiscount = createSelector(
	( state: AppState, annualProductSlugs: string[] | null ): string | null => {
		// Can't get discount info if we don't have any product slugs
		if ( ! annualProductSlugs?.length ) {
			return null;
		}

		// Get all the annual discounts as decimal percentages (between 0 and 1), removing any null results
		const discounts: number[] = annualProductSlugs
			.map( ( yearlySlug ) => {
				const yearly = getProductCost( state, yearlySlug );

				const monthlySlug = getMonthlySlugFromYearly( yearlySlug );
				const monthly = monthlySlug && getProductCost( state, monthlySlug );

				// Protect against null values and division by zero
				if ( ! yearly || ! monthly ) {
					return null;
				}

				const monthlyCostPerYear = monthly * 12;
				const yearlySavings = monthlyCostPerYear - yearly;

				return yearlySavings / monthlyCostPerYear;
			} )
			.filter( ( discount ): discount is number => Number.isFinite( discount ) );

		const highestDiscount = discounts.sort( ( a, b ) => ( a > b ? -1 : 1 ) )[ 0 ];
		const rounded = Math.round( 100 * highestDiscount );

		return rounded > 0 ? `${ rounded }%` : null;
	},
	[
		// HIDDEN DEPENDENCY: Discount rates differ based on the current user's currency code!
		getCurrentUserCurrencyCode,
		( state: AppState, annualProductSlugs: string[] | null ) => annualProductSlugs,
	],
	( state: AppState, annualProductSlugs: string[] | null ) => {
		const currencyCode = getCurrentUserCurrencyCode( state );
		return `${ currencyCode }-${ annualProductSlugs?.join?.() || '' }`;
	}
);

/**
 * Product UI utils.
 */

export function productButtonLabel(
	product: SelectorProduct,
	isOwned: boolean,
	isUpgradeableToYearly: boolean,
	currentPlan?: SitePlan | null
): TranslateResult {
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
}

export function slugIsFeaturedProduct( productSlug: string ): boolean {
	return FEATURED_PRODUCTS.includes( productSlug );
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

/**
 * Gets tooltip for product.
 *
 * @param product Product to check.
 * @param tiers Product price tiers.
 */
export function productTooltip(
	product: SelectorProduct,
	tiers: PriceTierEntry[]
): null | TranslateResult {
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
}

export function productAboveButtonText(
	product: SelectorProduct,
	siteProduct?: SiteProduct,
	isOwned?: boolean,
	isIncludedInPlan?: boolean
): TranslateResult | null {
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
}

/**
 * Type guards.
 */

function slugIsSelectorProductSlug( slug: string ): slug is SelectorProductSlug {
	return PRODUCTS_WITH_OPTIONS.includes( slug as typeof PRODUCTS_WITH_OPTIONS[ number ] );
}
function slugIsJetpackProductSlug( slug: string ): slug is JetpackProductSlug {
	return slug in JETPACK_PRODUCTS_LIST_WITH_FEATURES;
}
function slugIsJetpackPlanSlug( slug: string ): slug is JetpackPlanSlugs {
	return [ ...JETPACK_LEGACY_PLANS, ...JETPACK_RESET_PLANS ].includes( slug );
}

/**
 * Product parsing and data normalization utils.
 */

export function slugToItem( slug: string ): Plan | Product | SelectorProduct | null | undefined {
	if ( slugIsSelectorProductSlug( slug ) ) {
		return getForCurrentCROIteration( ( variation: Iterations ) =>
			OPTIONS_SLUG_MAP[ slug ]( variation )
		);
	} else if ( EXTERNAL_PRODUCTS_LIST.includes( slug ) ) {
		return getForCurrentCROIteration( ( variation: Iterations ) =>
			EXTERNAL_PRODUCTS_SLUG_MAP[ slug ]( variation )
		);
	} else if ( slugIsJetpackProductSlug( slug ) ) {
		return JETPACK_PRODUCTS_LIST_WITH_FEATURES[ slug ];
	} else if ( slugIsJetpackPlanSlug( slug ) ) {
		return getPlan( slug ) as Plan;
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

function objectIsPlan( item: Record< string, unknown > | Plan ): item is Plan {
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
	return null;
}

/**
 * Feature utils.
 */

/**
 * Builds the feature item of a product card, from a feature key.
 *
 * @param {JetpackPlanCardFeature} featureKey Key of the feature
 * @param {object?} options Options
 * @param {string?} options.withoutDescription Whether to build the card with a description
 * @param {string?} options.withoutIcon Whether to build the card with an icon
 * @param {string?} variation Experiment variation
 * @returns {SelectorProductFeaturesItem} Feature item
 */
export function buildCardFeatureItemFromFeatureKey(
	featureKey: JetpackPlanCardFeature,
	options?: { withoutDescription?: boolean; withoutIcon?: boolean },
	variation?: string
): SelectorProductFeaturesItem | undefined {
	let feature;
	let subFeaturesKeys;

	if ( Array.isArray( featureKey ) ) {
		const [ key, subKeys ] = featureKey;

		feature = getFeatureByKey( key );
		subFeaturesKeys = subKeys;
	} else {
		feature = getFeatureByKey( featureKey );
	}

	if ( feature ) {
		return {
			slug: feature.getSlug(),
			icon: options?.withoutIcon ? undefined : feature.getIcon?.( variation ),
			text: feature.getTitle( variation ),
			description: options?.withoutDescription ? undefined : feature.getDescription?.(),
			subitems: subFeaturesKeys
				? compact(
						subFeaturesKeys.map( ( f ) =>
							buildCardFeatureItemFromFeatureKey( f, options, variation )
						)
				  )
				: undefined,
			isHighlighted: feature.isProduct?.( variation ) || feature.isPlan,
		};
	}
}

/**
 * Builds the feature items passed to the product card, from feature keys.
 *
 * @param {JetpackPlanCardFeature[] | JetpackPlanCardFeatureSection} features Feature keys
 * @param {object?} options Options
 * @param {string?} variation Experiment variation
 * @returns {SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[]} Features
 */
export function buildCardFeaturesFromFeatureKeys(
	features: JetpackPlanCardFeature[] | JetpackPlanCardFeatureSection,
	options?: Record< string, unknown >,
	variation?: Iterations
): SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[] {
	// Without sections (JetpackPlanCardFeature[])
	if ( Array.isArray( features ) ) {
		return compact(
			features.map( ( f ) => buildCardFeatureItemFromFeatureKey( f, options, variation ) )
		);
	}

	// With sections (JetpackPlanCardFeatureSection)
	if ( isObject( features ) ) {
		const result = [] as SelectorProductFeaturesSection[];

		Object.getOwnPropertySymbols( features ).map( ( key ) => {
			const category = getFeatureCategoryByKey( key );
			const subfeatures = features[ key ];

			if ( category ) {
				result.push( {
					heading: category.getTitle(),
					list: subfeatures.map( ( f: JetpackPlanCardFeature ) =>
						buildCardFeatureItemFromFeatureKey( f, options, variation )
					),
				} as SelectorProductFeaturesSection );
			}
		} );

		return result;
	}

	return [];
}

/**
 * Builds the feature items passed to the product card, from a plan, product, or object.
 *
 * @param {Plan | Product | object} item Product, plan, or object
 * @param {object?} options Options
 * @param {string?} variation The current A/B test variation
 * @returns {SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[]} Features
 */
export function buildCardFeaturesFromItem(
	item: Plan | Product | Record< string, unknown >,
	options?: Record< string, unknown >,
	variation?: Iterations
): SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[] {
	if ( objectIsPlan( item ) ) {
		const features = item.getPlanCardFeatures?.( variation );

		if ( features ) {
			return buildCardFeaturesFromFeatureKeys( features, options, variation );
		}
	} else if ( typeof item.getFeatures === 'function' ) {
		const features = getForCurrentCROIteration( item.getFeatures );

		if ( features ) {
			return buildCardFeaturesFromFeatureKeys( features, options, variation );
		}
	}

	return buildCardFeaturesFromFeatureKeys( item, options, variation );
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
 * Returns the slug of an option product given a real product/plan slug.
 *
 * @param slug string
 * @returns string | null
 */
export function getOptionFromSlug( slug: string ): string | null {
	return SUBTYPE_TO_OPTION[ slug ];
}

/**
 * Adds products to the cart and redirects to the checkout page.
 *
 * @param {string} siteSlug Selected site
 * @param {string | string[]} products Slugs of the products to add to the cart
 * @param {QueryArgs} urlQueryArgs Additional query params appended to url (ie. for affiliate tracking, or whatever)
 */
export function checkout(
	siteSlug: string,
	products: string | string[],
	urlQueryArgs: QueryArgs = {}
): void {
	const productsArray = Array.isArray( products ) ? products : [ products ];
	const productsString = productsArray.join( ',' );

	// If there is not siteSlug, we need to redirect the user to the site selection
	// step of the flow. Since purchases of multiple products are allowed, we need
	// to pass all products separated by comma in the URL.
	const path = siteSlug
		? `/checkout/${ siteSlug }/${ productsString }`
		: `/jetpack/connect/${ productsString }`;

	if ( isJetpackCloud() && ! config.isEnabled( 'jetpack-cloud/connect' ) ) {
		window.location.href = addQueryArgs( urlQueryArgs, `https://wordpress.com${ path }` );
	} else {
		page( addQueryArgs( urlQueryArgs, path ) );
	}
}

/**
 * Redirects users to the appropriate URL to manage a site purchase.
 * On cloud.jetpack.com, the URL will point to wordpress.com. In any other case,
 * it will point to a relative path to the site purchase.
 *
 * @param {string} siteSlug Selected site
 * @param {number} purchaseId Id of a purchase
 */
export function manageSitePurchase( siteSlug: string, purchaseId: number ): void {
	const relativePath = managePurchase( siteSlug, purchaseId );
	if ( isJetpackCloud() ) {
		window.location.href = `https://wordpress.com${ relativePath }`;
	} else {
		page( relativePath );
	}
}

/**
 * Append "Available Options: Real-time and Daily" to the product description.
 *
 * @param product SelectorProduct
 *
 * @returns ReactNode | TranslateResult
 */
export const getJetpackDescriptionWithOptions = (
	product: SelectorProduct
): React.ReactNode | TranslateResult => {
	const em = React.createElement( 'em', null, null );

	// If the product has 'subtypes' (containing daily and real-time product slugs).
	// then append "Available options: Real-time or Daily" to the product description.
	return product.subtypes.some( ( subtype ) => DAILY_PRODUCTS.includes( subtype ) ) &&
		product.subtypes.some( ( subtype ) => REALTIME_PRODUCTS.includes( subtype ) )
		? translate( '%(productDescription)s {{em}}Available options: Real-time or Daily.{{/em}}', {
				args: {
					productDescription: product.description,
				},
				components: {
					em,
				},
		  } )
		: product.description;
};
