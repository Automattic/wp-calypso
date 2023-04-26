import getRawSite from 'calypso/state/selectors/get-raw-site';
import getJetpackComputedAttributes from './get-jetpack-computed-attributes';
import getSiteBySlug from './get-site-by-slug';
import getSiteComputedAttributes from './get-site-computed-attributes';

/**
 * Memoization cache for the `getSite` selector
 */
let getSiteCache = new WeakMap();

/**
 * Returns a normalized site object by its ID or site slug.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number|string|undefined}  siteIdOrSlug Site ID or site slug
 * @returns {import('@automattic/data-stores').SiteDetails|null|undefined}        Site object
 */
export default function getSite( state, siteIdOrSlug ) {
	if ( ! siteIdOrSlug ) {
		return null;
	}
	const rawSite = getRawSite( state, siteIdOrSlug ) || getSiteBySlug( state, siteIdOrSlug );
	if ( ! rawSite ) {
		return null;
	}

	// Use the rawSite object itself as a WeakMap key
	const cachedSite = getSiteCache.get( rawSite );
	if ( cachedSite ) {
		return cachedSite;
	}

	const site = {
		...rawSite,
		...getSiteComputedAttributes( state, rawSite.ID ),
		...getJetpackComputedAttributes( state, rawSite.ID ),
	};

	// Once the `rawSite` object becomes outdated, i.e., state gets updated with a newer version
	// and no more references are held, the key will be automatically removed from the WeakMap.
	getSiteCache.set( rawSite, site );
	return site;
}

getSite.clearCache = () => {
	getSiteCache = new WeakMap();
};
