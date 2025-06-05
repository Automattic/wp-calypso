import 'calypso/state/reader/init';
import { createSelector } from '@automattic/state-utils';
import {
	getReaderFollowForFeed,
	getReaderFollowForBlog,
} from 'calypso/state/reader/follows/selectors';
import { AppState } from 'calypso/types';

/**
 * Has feed / blog an organization id
 */
const hasReaderFollowsOrganization = createSelector(
	( state: AppState, feedId: number, blogId: number ): boolean => {
		let feed = getReaderFollowForFeed( state, Number( feedId ) );
		if ( ! feed ) {
			feed = getReaderFollowForBlog( state, Number( blogId ) );
		}

		return !! feed?.organization_id;
	},
	( state ) => [ state.reader.follows.items ]
);

export default hasReaderFollowsOrganization;
