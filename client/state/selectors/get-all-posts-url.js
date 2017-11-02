/** @format */
/**
 * External dependencies
 */
import { flowRight as compose, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import route from 'lib/route';
import { getSelectedSite } from 'state/ui/selectors';

const postTypeRoutes = { page: '/pages', post: '/posts' };

const determineBaseUrlFromType = type => get( postTypeRoutes, type, `/types/${ type }` );

const maybeAppendMyToUrl = site => url =>
	url === postTypeRoutes.post && site && ! site.jetpack && ! site.single_user_site
		? ( url += '/my' )
		: url;

const maybeAddSiteFragment = site => url =>
	site ? route.addSiteFragment( url, site.slug ) : url;

/**
 * Returns a site's URL or null if the site doesn't exist or the URL is unknown
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?String}        URL of site if known
 */
export default createSelector( ( state, postType ) => {
	const site = getSelectedSite( state );

	return compose(
		maybeAddSiteFragment( site ),
		maybeAppendMyToUrl( site ),
		determineBaseUrlFromType
	)( postType );
} );
