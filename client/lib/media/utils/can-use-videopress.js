/**
 * Returns whether a site can use VideoPress.
 *
 * @param {object} site Site object
 * @returns {boolean}
 */
export function canUseVideoPress( site ) {
	const isSiteJetpack = !! site.jetpack;
	const isVideoPressEnabled = site.options && site.options.videopress_enabled;
	const isVideoPressModuleActive =
		! isSiteJetpack ||
		( site.options.active_modules && site.options.active_modules.includes( 'videopress' ) );

	return isVideoPressEnabled || isVideoPressModuleActive;
}
