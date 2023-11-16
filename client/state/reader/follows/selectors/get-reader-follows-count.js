import { filter } from 'lodash';

import 'calypso/state/reader/init';

/*
 * Get the count of follows a user has
 *
 * @param  {object}  state  Global state tree
 * @returns {Integer} Follow count
 */
const getReaderFollowsCount = ( state ) =>
	Math.max(
		state.reader.follows.itemsCount,
		Object.keys( filter( state.reader.follows.items, { is_following: true } ) ).length
	);

export default getReaderFollowsCount;
