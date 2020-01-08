/**
 * External dependencies
 */

import { size, filter } from 'lodash';

/*
 * Get the count of follows a user has
 *
 * @param  {object}  state  Global state tree
 * @returns {Integer} Follow count
 */
const getReaderFollowsCount = state =>
	Math.max(
		state.reader.follows.itemsCount,
		size( filter( state.reader.follows.items, { is_following: true } ) )
	);

export default getReaderFollowsCount;
