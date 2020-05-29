/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import 'state/reader/init';

/**
 * Get sites by organization id
 */
const getOrganizationSites = createSelector(
	( state, organizationId ) => {
		// remove subs where the sub has an error
		return values( state.reader.follows.items ).filter(
			( blog ) => blog.organization_id === organizationId
		);
	},
	( state ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getOrganizationSites;
