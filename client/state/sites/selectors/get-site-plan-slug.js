/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSitePlan from 'state/sites/selectors/get-site-plan';

import 'state/sites/init';

export default function getSitePlanSlug( state, siteId ) {
	return get( getSitePlan( state, siteId ), 'product_slug' );
}
