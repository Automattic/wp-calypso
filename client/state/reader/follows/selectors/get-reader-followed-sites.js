import { createSelector } from '@automattic/state-utils';
import { NO_ORG_ID } from 'calypso/state/reader/organizations/constants';
import 'calypso/state/reader/init';

export const sorter = ( a, b ) => {
	const updatedA =
		typeof a.last_updated === 'number' && ! isNaN( a.last_updated ) ? a.last_updated : 0;
	const updatedB =
		typeof b.last_updated === 'number' && ! isNaN( b.last_updated ) ? b.last_updated : 0;
	// Most Recently updated at top
	if ( updatedA < updatedB ) {
		return 1;
	}
	if ( updatedA > updatedB ) {
		return -1;
	}
	// Tiebreaker: Alphabetical by name
	const nameA = a.name.toLowerCase();
	const nameB = b.name.toLowerCase();
	if ( nameA < nameB ) {
		return -1;
	}
	if ( nameA > nameB ) {
		return 1;
	}
	return 0;
};

/**
 * Get sites by organization id
 */
const getReaderFollowedSites = createSelector(
	( state ) => {
		return Object.values( state.reader.follows.items )
			.filter( ( blog ) => blog.organization_id === NO_ORG_ID )
			.sort( sorter );
	},
	( state ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getReaderFollowedSites;
