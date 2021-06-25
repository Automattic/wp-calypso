/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';
import { getSiteProducts } from 'calypso/state/sites/selectors';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

export default createSelector(
	( state: AppState, siteId: number | null, productSlug: string | string[] ): boolean | null => {
		const siteProducts = getSiteProducts( state, siteId );
		if ( null === siteProducts ) {
			return null;
		}
		if ( ! Array.isArray( productSlug ) ) {
			productSlug = [ productSlug ];
		}
		return siteProducts.some( ( product ) => productSlug.includes( product.productSlug ) );
	},
	( state: AppState, siteId: number | null ) => getSiteProducts( state, siteId ),
	( state: AppState, siteId: number | null, productSlug: string | string[] ): string => {
		siteId = siteId || 0;
		if ( ! Array.isArray( productSlug ) ) {
			productSlug = [ productSlug ];
		}
		return `${ siteId }-${ productSlug.join( '-' ) }`;
	}
);
