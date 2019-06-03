/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSitePlan from './get-site-plan';

export default function getSitePlanSlug( state, siteId ) {
	return get( getSitePlan( state, siteId ), 'product_slug' );
}
