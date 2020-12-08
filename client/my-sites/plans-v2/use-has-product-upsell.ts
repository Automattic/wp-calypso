/**
 * External dependencies
 */
import { intersection } from 'lodash';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getProductUpsell } from './utils';
import { getProductTermVariants } from 'calypso/lib/products-values';
import { getSiteProducts } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Type dependencies
 */
import type { ProductSlug } from 'calypso/lib/products-values/types';

/**
 * Returns a function that checks if a product upsells another product. Note that a product that
 * should be upsold won't be upsold is the current user owns it, owns a similar product with a
 * different term, or owns a product that overrides it.
 *
 * @returns {Function} Callback
 */
export default function useHasProductUpsell(): ( arg0: ProductSlug ) => boolean {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteProducts = useSelector( ( state ) =>
		siteId ? getSiteProducts( state, siteId ) : null
	);
	const siteProductsSlugs = siteProducts?.map( ( { productSlug: slug } ) => slug ) || [];

	return ( productSlug ) => {
		const upsellProduct = getProductUpsell( productSlug ) as ProductSlug;

		if ( ! upsellProduct ) {
			return false;
		}

		const upsellVariants = getProductTermVariants( upsellProduct ) || [];

		return intersection( [ upsellProduct, ...upsellVariants ], siteProductsSlugs ).length === 0;
	};
}
