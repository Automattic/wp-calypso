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
 * @return {Integer} Follow count
 */
const getReaderFollows = createSelector(
	state => values( filter( state.reader.follows.items, item => ! item.error ) ),
	state => [ state.reader.follows.items ],
);

export default getReaderFollows;
