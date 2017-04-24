/*
 * Get the count of follows a user has
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} Follow count
 */
const getReaderFollowsCount = state => Math.max(
	state.reader.follows.itemsCount,
	Object.keys( state.reader.follows.items ).length,
);

export default getReaderFollowsCount;
