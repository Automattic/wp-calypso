/**
 * External dependencies
 */
import { translate, TranslateResult, numberFormat } from 'i18n-calypso';
import page from 'page';
import { createElement, Fragment } from 'react';
import { createSelector } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import {
	EXTERNAL_PRODUCTS_LIST,
	EXTERNAL_PRODUCTS_SLUG_MAP,
	ITEM_TYPE_PRODUCT,
	ITEM_TYPE_PLAN,
} from './constants';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	TERM_BIENNIALLY,
	JETPACK_LEGACY_PLANS,
	JETPACK_RESET_PLANS,
	JETPACK_PLANS_BY_TERM,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCT_PRICE_MATRIX,
	JETPACK_PRODUCTS_BY_TERM,
	getPlan,
	getMonthlyPlanByYearly,
	getYearlyPlanByMonthly,
	planHasFeature,
	Product,
	JETPACK_SITE_PRODUCTS_WITH_FEATURES,
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
	DurationString,
	SelectorProductFeaturesItem,
	SelectorProductFeaturesSection,
	QueryArgs,
	SiteProduct,
} from './types';
import type { JetpackPlanSlug, Plan, JetpackProductSlug } from '@automattic/calypso-products';

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

function getSlugInTerm( yearlySlug: string | null, slugTerm: Duration ) {
	const mainTerm = slugTerm === TERM_MONTHLY ? 'monthly' : 'yearly';
	const oppositeTerm = mainTerm === 'monthly' ? 'yearly' : 'monthly';

	const matchingProduct = JETPACK_PRODUCTS_BY_TERM.find(
		( product ) => product[ oppositeTerm ] === yearlySlug
	);
	if ( matchingProduct ) {
		return matchingProduct[ mainTerm ];
	}

	const matchingPlan = JETPACK_PLANS_BY_TERM.find(
		( plan ) => plan[ oppositeTerm ] === yearlySlug
	);
	if ( matchingPlan ) {
		return matchingPlan[ mainTerm ];
	}

	return null;
}

/**
 * Get the monthly version of a product slug.
 *
 * @param {string} yearlySlug a yearly term product slug
 * @returns {string} a monthly term product slug
 */
export function getMonthlySlugFromYearly( yearlySlug: string | null ): string | null {
	return getSlugInTerm( yearlySlug, TERM_MONTHLY );
}

/**
 * Get the yearly version of a product slug.
 *
 * @param {string} monthlySlug a monthly term product slug
 * @returns {string} a yearly term product slug
 */
export function getYearlySlugFromMonthly( monthlySlug: string | null ): string | null {
	return getSlugInTerm( monthlySlug, TERM_ANNUALLY );
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

interface productButtonLabelProps {
	product: SelectorProduct;
	isOwned: boolean;
	isUpgradeableToYearly: boolean;
	isDeprecated: boolean;
	currentPlan?: SitePlan | null;
}

export function productButtonLabel( {
	product,
	isOwned,
	isUpgradeableToYearly,
	isDeprecated,
	currentPlan,
}: productButtonLabelProps ): TranslateResult {
	if ( isDeprecated ) {
		return translate( 'No longer available' );
	}

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

export function getPriceTierForUnits(
	tiers: PriceTierEntry[],
	units: number
): PriceTierEntry | null {
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

function slugIsJetpackProductSlug( slug: string ): slug is JetpackProductSlug {
	return slug in JETPACK_SITE_PRODUCTS_WITH_FEATURES;
}
function slugIsJetpackPlanSlug( slug: string ): slug is JetpackPlanSlug {
	return [ ...JETPACK_LEGACY_PLANS, ...JETPACK_RESET_PLANS ].includes( slug );
}

/**
 * Product parsing and data normalization utils.
 */

export function slugToItem( slug: string ): Plan | Product | SelectorProduct | null | undefined {
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
 * Feature utils.
 */

/**
 * Builds the feature item of a product card, from a feature key.
 *
 * @param {string[]|string} featureKey Key of the feature
 * @param {object?} options Options
 * @param {string?} options.withoutDescription Whether to build the card with a description
 * @param {string?} options.withoutIcon Whether to build the card with an icon
 * @param {string?} variation Experiment variation
 * @returns {SelectorProductFeaturesItem} Feature item
 */
export function buildCardFeatureItemFromFeatureKey(
	featureKey: string[] | string,
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
				? subFeaturesKeys
						.map( ( f ) => buildCardFeatureItemFromFeatureKey( f, options, variation ) )
						.filter( Boolean )
				: undefined,
			isHighlighted: feature.isProduct?.( variation ) || feature.isPlan,
		};
	}
}

/**
 * Builds the feature items passed to the product card, from feature keys.
 *
 * @param {string[]} features Feature keys
 * @param {object?} options Options
 * @param {string?} variation Experiment variation
 * @returns {SelectorProductFeaturesItem[]} Features
 */
export function buildCardFeaturesFromFeatureKeys(
	features: string[],
	options?: Record< string, unknown >,
	variation?: Iterations
): SelectorProductFeaturesItem[] {
	return features
		.map( ( f ) => buildCardFeatureItemFromFeatureKey( f, options, variation ) )
		.filter( Boolean );
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
		const features = item.getPlanCardFeatures?.();

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

	if ( isJetpackCloud() ) {
		// Unauthenticated users will be presented with a Jetpack branded version of the login form
		// if the URL has the query parameter `source=jetpack-plans`. We only want to do this if the
		// user is in Jetpack Cloud.
		if ( ! urlQueryArgs.source ) {
			urlQueryArgs.source = 'jetpack-plans';
		}

		// This URL is used when clicking the back button in the checkout screen to redirect users
		// back to cloud instead of wordpress.com
		if ( ! urlQueryArgs.checkoutBackUrl ) {
			urlQueryArgs.checkoutBackUrl = window.location.href;
		}
	}

	if ( config.isEnabled( 'jetpack/userless-checkout' ) ) {
		const { unlinked, purchasetoken, purchaseNonce, site } = urlQueryArgs;
		const canDoUnlinkedCheckout = unlinked && !! site && ( !! purchasetoken || purchaseNonce );

		// Enter userless checkout if unlinked, purchasetoken or purchaseNonce, and site are all set
		if ( isJetpackCloud() && canDoUnlinkedCheckout ) {
			const host =
				'development' === urlQueryArgs.calypso_env
					? 'http://calypso.localhost:3000'
					: 'https://wordpress.com';

			window.location.href = addQueryArgs(
				urlQueryArgs,
				host + `/checkout/jetpack/${ siteSlug }/${ productsString }`
			);
			return;
		}
	}

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
 * Return the slug of a highlighted product if the given slug is Jetpack product
 * slug, otherwise, return null.
 *
 * @param {string} productSlug the slug of a Jetpack product
 *
 * @returns {[string, string] | null} the monthly and yearly slug of a supported Jetpack product
 */
export function getHighlightedProduct( productSlug?: string ): [ string, string ] | null {
	if ( ! productSlug ) {
		return null;
	}

	// If neither of these methods return a slug, it means that the `productSlug`
	// is not really a Jetpack product slug.
	const yearlySlug = getYearlySlugFromMonthly( productSlug );
	const monthlySlug = getMonthlySlugFromYearly( productSlug );

	if ( monthlySlug ) {
		return [ monthlySlug, productSlug ];
	} else if ( yearlySlug ) {
		return [ productSlug, yearlySlug ];
	}

	return null;
}
