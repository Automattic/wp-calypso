import { filterListBySearchTerm } from '@automattic/help-center';
import { createSelector } from '@automattic/state-utils';
import { getLocaleSlug } from 'i18n-calypso';
import { getAdminSections } from 'calypso/blocks/inline-help/admin-sections';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns a filtered site admin collection using the memoized getAdminSections.
 *
 * Note that the first argument `state` is not used,
 * because the admin sections are store in the admin-sections.js,
 * in the inline-block component.
 * @param   {Object} state      Global state tree
 * @param   {string} searchTerm The search term
 * @param   {number} limit      The maximum number of results to show
 * @returns {Array}             A filtered (or empty) array
 */
const getAdminHelpResults = createSelector(
	( state, searchTerm = '', limit ) => {
		if ( ! searchTerm ) {
			return [];
		}

		const siteId = getSelectedSiteId( state );

		return filterListBySearchTerm(
			searchTerm,
			getAdminSections( state, siteId ),
			limit,
			getLocaleSlug()
		);
	},
	( state ) => [ getSelectedSiteId( state ) ]
);

export default getAdminHelpResults;
