import {
	getJetpackProductDisplayName,
	getJetpackProductTagline,
	getJetpackProductCallToAction,
	getJetpackProductDescription,
	getJetpackProductShortDescription,
	getJetpackProductFeaturedDescription,
	getJetpackProductLightboxDescription,
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
	getJetpackProductWhatIsIncluded,
	getJetpackProductBenefits,
	getJetpackProductRecommendedFor,
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

function getDisclaimerLink() {
	const backupStorageFaqId = 'backup-storage-limits-faq';

	const urlParams = new URLSearchParams( window.location.search );
	const calypsoEnv = urlParams.get( 'calypso_env' );
	// Check to see if FAQ is on the current page
	// This is so we can anchor link to it instead of opening a new window if it is on the page already
	const backupStorageFaq = document.getElementById( backupStorageFaqId );

	if ( backupStorageFaq ) {
		return `#${ backupStorageFaqId }`;
	}

	return calypsoEnv === 'development'
		? `http://jetpack.cloud.localhost:3000/pricing#${ backupStorageFaqId }`
		: `https://cloud.jetpack.com/pricing#${ backupStorageFaqId }`;
}

function getFeaturedProductDescription( item: Product ) {
	return getJetpackProductFeaturedDescription( item ) ?? '';
}

function getFeaturedPlanDescription( item: Plan ) {
	return getForCurrentCROIteration( item.getFeaturedDescription ) ?? '';
}

function getLightboxProductDescription( item: Product ) {
	return getJetpackProductLightboxDescription( item ) ?? '';
}

function getLightboxPlanDescription( item: Plan ) {
	return getForCurrentCROIteration( item.getLightboxDescription ) ?? '';
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
		const features = buildCardFeaturesFromItem( item );

		return {
			productSlug: item.product_slug,
			// Using the same slug for any duration helps prevent unnecessary DOM updates
			iconSlug,
			displayName: getJetpackProductDisplayName( item ) ?? '',
			type: ITEM_TYPE_PRODUCT,
			shortName: getJetpackProductShortName( item ) || '',
			tagline: getJetpackProductTagline( item ) ?? '',
			description: getJetpackProductDescription( item ),
			shortDescription: getJetpackProductShortDescription( item ),
			featuredDescription: getFeaturedProductDescription( item ),
			lightboxDescription: getLightboxProductDescription( item ),
			buttonLabel: getJetpackProductCallToAction( item ),
			whatIsIncluded: getJetpackProductWhatIsIncluded( item ),
			benefits: getJetpackProductBenefits( item ),
			recommendedFor: getJetpackProductRecommendedFor( item ),
			monthlyProductSlug,
			term: item.term,
			categories: item.categories,
			hidePrice: ( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes(
				item.product_slug
			),
			features: {
				items: features,
			},
			disclaimer: getJetpackProductDisclaimer( item.product_slug, features, getDisclaimerLink() ),
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
		const features = buildCardFeaturesFromItem( item );
		return {
			productSlug,
			// Using the same slug for any duration helps prevent unnecessary DOM updates
			iconSlug: ( yearlyProductSlug || productSlug ) + iconAppend,
			displayName: getForCurrentCROIteration( item.getTitle ) ?? '',
			type: ITEM_TYPE_PLAN,
			shortName: getForCurrentCROIteration( item.getTitle ) ?? '',
			tagline: getForCurrentCROIteration( item.getTagline ) || '',
			description: getForCurrentCROIteration( item.getDescription ),
			featuredDescription: getFeaturedPlanDescription( item ),
			lightboxDescription: getLightboxPlanDescription( item ),
			whatIsIncluded: item.getWhatIsIncluded
				? getForCurrentCROIteration( item.getWhatIsIncluded )
				: [],
			benefits: item.getBenefits ? getForCurrentCROIteration( item.getBenefits ) : [],
			recommendedFor: item.getRecommendedFor
				? getForCurrentCROIteration( item.getRecommendedFor )
				: [],
			monthlyProductSlug,
			term: item.term === TERM_BIENNIALLY ? TERM_ANNUALLY : item.term,
			features: {
				items: buildCardFeaturesFromItem( item ),
			},
			disclaimer: getJetpackProductDisclaimer( item.getStoreSlug(), features, getDisclaimerLink() ),
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
