import { createSelector } from '@automattic/state-utils';
import { sorter } from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';
import 'calypso/state/reader/init';

/**
 * Get sites by organization id
 */
const getOrganizationSites = createSelector(
	( state, organizationId ) => {
		// remove subs where the sub has an error
		return Object.values( state.reader.follows.items )
			.filter( ( blog ) => blog.organization_id === organizationId )
			.sort( sorter );
	},
	( state ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getOrganizationSites;
