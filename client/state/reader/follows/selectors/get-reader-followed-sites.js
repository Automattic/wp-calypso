/**
 * External dependencies
 */
import { values, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import 'state/reader/init';
import { NO_ORG_ID } from 'state/reader/organizations/constants';

export const sorter = ( blog ) => blog.name.toLowerCase();

/**
 * Get sites by organization id
 */
const getReaderFollowedSites = createSelector(
	( state ) => {
		// remove subs where the sub has an error
		return sortBy(
			values( state.reader.follows.items ).filter( ( blog ) => blog.organization_id === NO_ORG_ID ),
			sorter
		);
	},
	( state ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getReaderFollowedSites;
