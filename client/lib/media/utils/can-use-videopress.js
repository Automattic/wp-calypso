import { isModuleActive } from 'calypso/lib/site/utils';

const VIDEOPRESS_FEATURE = 'videopress';

/**
 * Atomic sites keep the VideoPress module active whatever their plan, but VideoPress videos only
 * play on plans that include VideoPress. Some plans can upload video files without it, and those
 * videos have to go to the site's own media library. Unknown plan features defer to the server.
 * @param {import('@automattic/data-stores').SiteDetails} site Site object
 * @returns {boolean}
 */
function isAtomicSiteWithoutVideoPress( site ) {
	const isAtomic = site.is_wpcom_atomic || site.options?.is_wpcom_atomic;
	const activeFeatures = site.plan?.features?.active;

	return (
		!! isAtomic &&
		Array.isArray( activeFeatures ) &&
		! activeFeatures.includes( VIDEOPRESS_FEATURE )
	);
}

/**
 * Returns whether a site can use VideoPress.
 * @param {import('@automattic/data-stores').SiteDetails} site Site object
 * @returns {boolean}
 */
export function canUseVideoPress( site ) {
	if ( isAtomicSiteWithoutVideoPress( site ) ) {
		return false;
	}

	const isSiteJetpack = !! site.jetpack;
	const isVideoPressEnabled = site.options?.videopress_enabled ?? false;
	const isVideoPressModuleActive = ! isSiteJetpack || isModuleActive( site, 'videopress' );

	return isVideoPressEnabled || isVideoPressModuleActive;
}
