import { createSelector } from '@automattic/state-utils';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import type { SiteExcerptData } from '@automattic/sites';
import type { AppState } from 'calypso/types';

/**
 * Returns whether the current user has manage_options capability for the other environment site.
 * For staging sites, checks production site permissions.
 * For production sites, checks staging site permissions.
 * @param {Object} state Global state tree
 * @param {SiteExcerptData} site Site data
 * @returns {boolean} Whether the user has manage_options capability
 */
export const canCurrentUserSwitchEnvironment = createSelector(
	( state: AppState, site: SiteExcerptData ) => {
		const otherEnvironmentSiteID = site.is_wpcom_staging_site
			? site.options?.wpcom_production_blog_id
			: site.options?.wpcom_staging_blog_ids?.[ 0 ];

		return canCurrentUser( state, otherEnvironmentSiteID, 'manage_options' ) ?? false;
	},
	( state: AppState, site: SiteExcerptData ) => [
		state.currentUser.capabilities,
		site.is_wpcom_staging_site,
		site.options?.wpcom_production_blog_id,
		site.options?.wpcom_staging_blog_ids,
	]
);
