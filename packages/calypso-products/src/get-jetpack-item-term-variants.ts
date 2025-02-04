import { JETPACK_PLANS_BY_TERM, JETPACK_PRODUCTS_BY_TERM } from './constants';
import { isJetpackPlanSlug, isJetpackProductSlug, JetpackPurchasableItemSlug } from '.';

type termMap = { yearly: JetpackPurchasableItemSlug; monthly: JetpackPurchasableItemSlug };

/**
 * Return the slugs of a Jetpack plan or product for all existing terms.
 * @param itemSlug Slug of the Jetpack product or plan
 * @returns Object with term and product slug as key/value
 */
export function getJetpackItemTermVariants(
	itemSlug: JetpackPurchasableItemSlug
): termMap | undefined {
	if ( isJetpackPlanSlug( itemSlug ) ) {
		return JETPACK_PLANS_BY_TERM.find( ( terms ) =>
			( Object.values( terms ) as JetpackPurchasableItemSlug[] ).includes( itemSlug )
		) as termMap;
	}

	if ( isJetpackProductSlug( itemSlug ) ) {
		return JETPACK_PRODUCTS_BY_TERM.find( ( terms ) =>
			( Object.values( terms ) as JetpackPurchasableItemSlug[] ).includes( itemSlug )
		) as termMap;
	}
}
