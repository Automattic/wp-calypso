/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import 'state/reader/init';
import { getSite } from 'state/sites/selectors';

/*
 * Get all non a8c p2s user follows
 *
 * @param  {object}  state  Global state tree
 * @returns {Array} Followed sites/feeds
 */
const getReaderFollowsP2 = createSelector(
	( state ) => {
		// remove subs where the sub has an error
		const items = values( state.reader.follows.items ).filter(
			( blog ) => blog.is_a8c === false && blog.is_p2 === true
		);

		return items.map( ( item ) => getSite( state, item.blog_ID ) );
	},
	( state ) => [
		state.reader.follows.items,
		state.reader.feeds.items,
		state.reader.sites.items,
		state.currentUser.capabilities,
	]
);

export default getReaderFollowsP2;
