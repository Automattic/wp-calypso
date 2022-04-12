import { createSelector } from '@automattic/state-utils';
import {
	getReaderFollowForFeed,
	getReaderFollowForBlog,
} from 'calypso/state/reader/follows/selectors';
import 'calypso/state/reader/init';

/**
 * Has feed / blog an organization id
 */
const hasReaderFollowsOrganization = createSelector(
	( state, feedId, blogId ) => {
		let feed = getReaderFollowForFeed( state, parseInt( feedId ) );
		if ( ! feed ) {
			feed = getReaderFollowForBlog( state, parseInt( blogId ) );
		}

		return !! feed?.organization_id;
	},
	( state ) => [ state.reader.follows.items ]
);

export default hasReaderFollowsOrganization;
