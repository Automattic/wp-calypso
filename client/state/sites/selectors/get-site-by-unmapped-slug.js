import { createSelector } from '@automattic/state-utils';
import { withoutHttp } from 'calypso/lib/url';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import getSiteOption from './get-site-option';

/**
 * Returns a site object by a slug of its unmapped url.
 *
 * @param {object} state Global state tree
 * @param {string} unmappedSiteSlug Unmapped site slug
 * @returns {?object} Site object
 */
export default createSelector(
	( state, unmappedSiteSlug ) => {
		const sites = Object.values( getSitesItems( state ) );
		return (
			sites.find(
				( site ) =>
					withoutHttp( getSiteOption( state, site.ID, 'unmapped_url' ) ) === unmappedSiteSlug
			) ?? null
		);
	},
	( state ) => [ getSitesItems( state ) ]
);
