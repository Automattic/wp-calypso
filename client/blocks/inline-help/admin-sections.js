import { generateAdminSections } from '@automattic/data-stores';
import { createSelector } from '@automattic/state-utils';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { onboardingUrl } from 'calypso/lib/paths';
import { getCustomizerUrl, getSiteSlug } from 'calypso/state/sites/selectors';

/**
 * Returns admin section items with site-based urls.
 * @param   {number} siteId   - The current site ID.
 * @param   {string} siteSlug - The current site slug.
 * @param   {Object} state    - Global state
 * @returns {Array}             An array of admin sections with site-specific URLs.
 */
export const getAdminSections = createSelector(
	( state, siteId ) => {
		const siteSlug = getSiteSlug( state, siteId );

		const sections = generateAdminSections(
			siteSlug,
			{
				root: getCustomizerUrl( state, siteId ),
				homepage: getCustomizerUrl( state, siteId, 'homepage' ),
				identity: getCustomizerUrl( state, siteId, 'identity' ),
				menus: getCustomizerUrl( state, siteId, 'menus' ),
			},
			getGoogleMailServiceFamily(),
			onboardingUrl()
		);
		return sections;
	},
	( state, siteId ) => [ getSiteSlug( state, siteId ) ]
);
