/**
 * Internal dependencies
 */
import { urlToSlug } from 'lib/url';
import getSiteBySlug from 'state/sites/selectors/get-site-by-slug';

import 'state/sites/init';

/**
 * Returns a site object by its URL.
 *
 * @param  {object}  state Global state tree
 * @param  {string}  url   Site URL
 * @returns {?object}       Site object
 */
export default function getSiteByUrl( state, url ) {
	const slug = urlToSlug( url );

	return getSiteBySlug( state, slug );
}
