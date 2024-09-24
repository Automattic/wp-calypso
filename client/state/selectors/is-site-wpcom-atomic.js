import getRawSite from './get-raw-site';

/**
 * Retruns true if the questioned site is a WPCOM Atomic site.
 * @param {Object} state the global state tree
 * @param {number|undefined} siteId the questioned site ID.
 * @returns {boolean} Whether the site is a WPCOM Atomic site.
 */
export default function isSiteWpcomAtomic( state, siteId ) {
	const site = getRawSite( state, siteId );
	return site?.options?.is_wpcom_atomic ?? false;
}
