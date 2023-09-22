import { isModuleActive } from 'calypso/lib/site/utils';

/**
 * Returns whether a site can use VideoPress.
 * @param {import('@automattic/data-stores').SiteDetails} site Site object
 * @returns {boolean}
 */
export function canUseVideoPress( site ) {
	const isSiteJetpack = !! site.jetpack;
	const isVideoPressEnabled = site.options?.videopress_enabled ?? false;
	const isVideoPressModuleActive = ! isSiteJetpack || isModuleActive( site, 'videopress' );

	return isVideoPressEnabled || isVideoPressModuleActive;
}
