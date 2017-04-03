/**
 * External dependencies
 */
import { filter } from 'lodash';

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
export default createSelector(
	state => filter( state.reader.follows.items, [ 'is_following', true ] ),
	state => [ state.reader.follows.items ],
);
