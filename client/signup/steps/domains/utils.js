import { EXAMPLE_FLOW } from '@automattic/onboarding';
import validUrl from 'valid-url';

// Only override the back button from an external URL source on the below step(s) which is typically where we'd send them to as the 'entry'.
// We don't want to send them "back" to the source URL if they click back on "domains-launch/mapping" for example. Just send them back to the previous step.
export const backUrlExternalSourceStepsOverrides = [ 'use-your-domain' ];

// Override Back link if source parameter is found below
export const backUrlSourceOverrides = {
	'business-name-generator': '/business-name-generator',
	domains: '/domains',
};

export function getExternalBackUrl( source, sectionName = null ) {
	if ( ! source ) {
		return false;
	}

	if ( backUrlSourceOverrides[ source ] ) {
		return backUrlSourceOverrides[ source ];
	}

	if (
		backUrlExternalSourceStepsOverrides.includes( sectionName ) &&
		validUrl.isWebUri( source )
	) {
		return source;
	}

	return false;
}

/**
 * Check if we should use multiple domains in domain flows.
 */
export function shouldUseMultipleDomainsInCart( flowName ) {
	const enabledFlows = [ 'domain', 'onboarding', EXAMPLE_FLOW ];

	return enabledFlows.includes( flowName );
}

export function sortProductsByPriceDescending( productsInCart ) {
	// Sort products by price descending, considering promotions.
	const getSortingValue = ( product ) => {
		if ( product.item_subtotal_integer !== 0 ) {
			return product.item_subtotal_integer;
		}

		// Use the lowest non-zero new_price or fallback to item_original_cost_integer.
		const nonZeroPrices =
			product.cost_overrides
				?.map( ( override ) => override.new_price * 100 )
				.filter( ( price ) => price > 0 ) || [];

		return nonZeroPrices.length ? Math.min( ...nonZeroPrices ) : product.item_original_cost_integer;
	};

	return productsInCart.sort( ( a, b ) => {
		return getSortingValue( b ) - getSortingValue( a );
	} );
}
