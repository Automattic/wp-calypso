import { getJetpackProductDisplayName } from './get-jetpack-product-display-name';
import { getProductFromSlug } from './get-product-from-slug';
import { getPlan } from './main';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Get Jetpack product display name based on the product purchase object.
 */
export function getJetpackProductOrPlanDisplayName(
	productSlug: string
): TranslateResult | undefined {
	const product = getProductFromSlug( productSlug );
	let productName: TranslateResult | undefined = '';

	if ( typeof product === 'string' ) {
		const plan = getPlan( productSlug );
		productName = plan ? plan.getTitle() : '';
	} else if ( typeof product === 'object' && 'product_name' in product ) {
		productName = getJetpackProductDisplayName( product );
	}

	return productName;
}
