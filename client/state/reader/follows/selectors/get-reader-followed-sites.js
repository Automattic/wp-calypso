/**
 * External dependencies
 */
import { values, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import 'calypso/state/reader/init';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';

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
