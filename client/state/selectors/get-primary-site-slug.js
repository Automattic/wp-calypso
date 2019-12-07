/**
 * Internal dependencies
 */
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import { getSiteSlug } from 'state/sites/selectors';

/**
 * Returns the current user's primary site's slug.
 *
 * @param  {Object}  state Global state tree
 * @return {?String}       The current user's primary site's slug
 */
export default function getPrimarySiteSlug( state ) {
	const primarySiteId = getPrimarySiteId( state );
	return getSiteSlug( state, primarySiteId );
}
