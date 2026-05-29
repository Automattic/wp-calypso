import { createSelector } from '@automattic/state-utils';
import { forEach } from 'lodash';
import 'calypso/state/reader/init';

const sortByLastUpdated = ( a, b ) => {
	const updatedA =
		typeof a.last_updated === 'number' && ! isNaN( a.last_updated ) ? a.last_updated : 0;
	const updatedB =
		typeof b.last_updated === 'number' && ! isNaN( b.last_updated ) ? b.last_updated : 0;

	if ( updatedA < updatedB ) {
		return 1;
	}
	if ( updatedA > updatedB ) {
		return -1;
	}

	const nameA = ( a.name || '' ).toLowerCase();
	const nameB = ( b.name || '' ).toLowerCase();
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
const getOrganizationFeedsInfo = createSelector(
	( state, organizationId ) => {
		const sites = Object.values( state.reader.follows.items )
			.filter( ( item ) => item && ! item.error && item.organization_id === organizationId )
			.sort( sortByLastUpdated );

		const info = {
			unseenCount: 0,
			feedIds: [],
			feedUrls: [],
		};
		// remove subs where the sub has an error
		forEach( sites, ( item ) => {
			info.unseenCount += item.unseen_count;
			info.feedIds.push( item.feed_ID );
			info.feedUrls.push( item.feed_URL );
		} );

		return info;
	},
	( state ) => [ state.reader.follows.items, state.currentUser.capabilities ]
);

export default getOrganizationFeedsInfo;
