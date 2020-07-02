/**
 * External dependencies
 */
import { intersection } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSiteProducts } from 'state/sites/selectors';

/**
 * Type dependencies
 */
import type { AppState } from 'types';

export default createSelector(
	( state: AppState, siteId: number | null, productSlug: string | string[] ): boolean | null => {
		const siteProducts = getSiteProducts( state, siteId );
		if ( null === siteProducts ) {
			return null;
		}
		if ( ! Array.isArray( productSlug ) ) {
			productSlug = [ productSlug ];
		}
		return (
			intersection(
				siteProducts.map( ( { productSlug: slug } ) => slug ),
				productSlug
			).length > 0
		);
	},
	( state: AppState, siteId: number | null ) => getSiteProducts( state, siteId )
);
