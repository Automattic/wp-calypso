import getRawSite from './get-raw-site';

/**
 * Returns the P2 hub blog id for the site. If the site is a hub the id will be
 * the same as the site id.
 * @param {Object} state Global state tree
 * @param {number|undefined} siteId the site ID
 * @returns {?number} Blog ID of the site's hub if it is a P2 – otherwise null.
 */
export default function getP2HubBlogId( state, siteId ) {
	const site = getRawSite( state, siteId );
	return site?.options?.p2_hub_blog_id ?? null;
}
