/*
 * How many sites has the user followed (in this session)?
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} Follow count
 */
export function getFollowCount( state ) {
	return state.reader.follows.items.length;
}
