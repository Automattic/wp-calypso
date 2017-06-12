/**
 * Build a key for feed search queries
 *
 * Key format is {literalQuery}-{X|A}.
 *   X if we excluded followed sites,
 *   A if we did not
 * For example: a search for "halloween", excluding followed sites, would be
 *   halloween-X
 * @param  {object} query The feed search action
 * @return {string} the key
 */
export default function keyBy( query ) {
	const excludeFollowed = query.excludeFollowed ? 'X' : 'A';
	return `${ query.query }-${ excludeFollowed }`;
}
