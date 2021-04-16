/**
 * External dependencies
 */
import { createElement } from 'react';
import { translate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getMonthlyPlanByYearly, getYearlyPlanByMonthly } from '@automattic/calypso-products';
import { JETPACK_RESET_PLANS } from '@automattic/calypso-products';
import { DAILY_PRODUCTS, REALTIME_PRODUCTS, SELECTOR_PLANS } from '../constants';
import { slugToSelectorProduct } from '../utils/product-parsing';

/**
 * Type dependencies
 */
import type { Duration, SelectorProduct } from '../types';

/**
 * Append "Available Options: Real-time and Daily" to the product description.
 *
 * @param product SelectorProduct
 *
 * @returns ReactNode | TranslateResult
 */
const getJetpackDescriptionWithOptions = (
	product: SelectorProduct
): React.ReactNode | TranslateResult => {
	const em = createElement( 'em', null, null );

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

// Map over all plan slugs and convert them to SelectorProduct types.
export const getPlansToDisplay = ( {
	duration,
	currentPlanSlug,
}: {
	duration: Duration;
	currentPlanSlug: string | null;
} ): SelectorProduct[] => {
	const currentPlanTerms = currentPlanSlug
		? [ getMonthlyPlanByYearly( currentPlanSlug ), getYearlyPlanByMonthly( currentPlanSlug ) ]
		: [];

	const plansToDisplay = SELECTOR_PLANS.map( slugToSelectorProduct )
		// Remove plans that don't fit the filters or have invalid data.
		.filter(
			( product: SelectorProduct | null ): product is SelectorProduct =>
				!! product &&
				product.term === duration &&
				// Don't include a plan the user already owns, regardless of the term
				! currentPlanTerms.includes( product.productSlug )
		)
		.map( ( product: SelectorProduct ) => ( {
			...product,
			description: getJetpackDescriptionWithOptions( product ),
		} ) );

	if ( currentPlanSlug && JETPACK_RESET_PLANS.includes( currentPlanSlug ) ) {
		const currentPlanSelectorProduct = slugToSelectorProduct( currentPlanSlug );
		if ( currentPlanSelectorProduct ) {
			return [ currentPlanSelectorProduct, ...plansToDisplay ];
		}
	}

	return plansToDisplay;
};

export const getProductsToDisplay = ( {
	duration,
	availableProducts,
	purchasedProducts,
	includedInPlanProducts,
}: {
	duration: Duration;
	availableProducts: ( SelectorProduct | null )[];
	purchasedProducts: ( SelectorProduct | null )[];
	includedInPlanProducts: ( SelectorProduct | null )[];
} ): SelectorProduct[] => {
	const purchasedSlugs =
		purchasedProducts?.map( ( p ) => p?.productSlug )?.filter( ( slug ) => slug ) || [];

	// Products that have not been directly purchased must honor the current filter
	// selection since they exist in both monthly and yearly version.
	const filteredProducts = [ ...includedInPlanProducts, ...availableProducts ]
		// Remove products that don't match the selected duration
		.filter( ( product ): product is SelectorProduct => product?.term === duration )
		// Remove duplicates (only happens if the site somehow has the same product
		// both purchased and included in a plan, very unlikely)
		.filter( ( product ) => {
			if ( product.productSlug && purchasedSlugs.includes( product.productSlug ) ) {
				return false;
			}

			if ( product.monthlyProductSlug && purchasedSlugs.includes( product.monthlyProductSlug ) ) {
				return false;
			}

			return true;
		} );
	return (
		[ ...purchasedProducts, ...filteredProducts ]
			// Make sure we don't allow any null or invalid products
			.filter( ( product ): product is SelectorProduct => !! product )
			.map( ( product ) => ( {
				...product,
				description: getJetpackDescriptionWithOptions( product as SelectorProduct ),
			} ) )
	);
};

export const isConnectionFlow = (): boolean =>
	/jetpack\/connect\/plans/.test( window.location.href ) ||
	/source=jetpack-connect-plans/.test( window.location.href );

export const isConnectStore = (): boolean => /jetpack\/connect\/store/.test( window.location.href );
