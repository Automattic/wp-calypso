/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default ( siteState, requireData ) => ( productId, requirements ) => {
	requireData( 'products', [ productId ], requirements );

	return get( siteState, [ 'products', productId, 'data' ], null );
};
