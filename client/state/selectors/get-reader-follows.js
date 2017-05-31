/**
 * External dependencies
 */
import { values, filter } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/*
 * Get all sites/feeds the user follows.
 *
 * @param  {Object}  state  Global state tree
 * @return {Array} Followed sites/feeds
 */
const getReaderFollows = createSelector(
	state => filter( values( state.reader.follows.items ), item => ! item.error ),
	state => [ state.reader.follows.items, state.reader.feeds.items, state.reader.sites.items ],
);

export default getReaderFollows;
