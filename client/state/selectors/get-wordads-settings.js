import { createSelector } from '@automattic/state-utils';
import getJetpackSettings from 'calypso/state/selectors/get-jetpack-settings';
import { isJetpackSite } from 'calypso/state/sites/selectors';

import 'calypso/state/wordads/init';

/**
 * Returns the WordAds settings on a certain site.
 * Returns null if the site is unknown, or settings have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  The ID of the site we're querying
 * @returns {?Object}        WordAds settings
 */
export const getWordadsSettings = createSelector(
	( state, siteId ) => {
		const settings = state.wordads.settings.items[ siteId ];
		if ( ! settings ) {
			return null;
		}

		const isJetpack = isJetpackSite( state, siteId );

		// WordAds settings on Jetpack sites are not available on the WordAds state, so we get
		// them from the site settings.
		let jetpackSettings = {};
		if ( isJetpack ) {
			const siteSettings = getJetpackSettings( state, siteId );
			if ( ! siteSettings ) {
				return null;
			}
			jetpackSettings = {
				jetpack_module_enabled: siteSettings.wordads,
				display_options: {
					display_front_page: siteSettings.wordads_display_front_page,
					display_post: siteSettings.wordads_display_post,
					display_page: siteSettings.wordads_display_page,
					display_archive: siteSettings.wordads_display_archive,
					enable_header_ad: siteSettings.enable_header_ad,
					second_belowpost: siteSettings.wordads_second_belowpost,
				},
				ccpa_enabled: siteSettings.wordads_ccpa_enabled,
				ccpa_privacy_policy_url: siteSettings.wordads_ccpa_privacy_policy_url,
				custom_adstxt_enabled: siteSettings.wordads_custom_adstxt_enabled,
				custom_adstxt: siteSettings.wordads_custom_adstxt,
			};
		}

		return {
			...settings,
			...jetpackSettings,
		};
	},
	( state, siteId ) => [
		state.wordads.settings.items[ siteId ],
		isJetpackSite( state, siteId ),
		getJetpackSettings( state, siteId ),
	]
);

export default getWordadsSettings;
