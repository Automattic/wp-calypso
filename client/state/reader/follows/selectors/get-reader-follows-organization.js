/**
 * External dependencies
 */
import { values, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import 'state/reader/init';
import { sorter } from 'state/reader/follows/selectors/get-reader-followed-sites';

/**
 * Get sites by organization id
 */
const getOrganizationSites = createSelector(
	( state, organizationId ) => {
		// remove subs where the sub has an error
		return sortBy(
			values( state.reader.follows.items ).filter(
				( blog ) => blog.organization_id === organizationId
			),
			sorter
		);
	},
	( state ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getOrganizationSites;
