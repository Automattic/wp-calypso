/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export function getVariationsForProduct( state, productId, siteId = getSelectedSiteId( state ) ) {
	const variationsByProduct = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'productVariations',
	] );

	return variationsByProduct && variationsByProduct[ productId ];
}
