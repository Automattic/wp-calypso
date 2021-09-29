import { createSelector } from '@automattic/state-utils';
import { sortBy } from 'lodash';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';
import 'calypso/state/reader/init';

export const sorter = ( blog ) => blog.last_updated * -1;

/**
 * Get sites by organization id
 */
const getReaderFollowedSitesByUpdated = createSelector(
	( state ) => {
		// remove subs where the sub has an error
		return sortBy(
			Object.values( state.reader.follows.items ).filter(
				( blog ) => blog.organization_id === NO_ORG_ID
			),
			sorter
		);
	},
	( state ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getReaderFollowedSitesByUpdated;
