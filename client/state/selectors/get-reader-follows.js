/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/*
 * Get all sites/feeds the user follows.
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} Follow count
 */
const getReaderFollows = createSelector(
	state => values( state.reader.follows.items ),
	state => [ state.reader.follows.items ],
);

export default getReaderFollows;
