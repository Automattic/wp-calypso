/*
 * How many sites has the user followed?
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer} Follow count
 */
export default function getFollowCount( state ) {
	return state.reader.follows.items.length;
}
