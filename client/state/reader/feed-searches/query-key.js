/**
 * Build a key for feed search queries
 *
 * Key format is {literalQuery}-{excludeFlag}-{sort}.
 * literal query: the literal query text
 * exclude flag:
 *   X if we excluded followed sites,
 *   A if we did not
 * sort:
 *   text of the sort order. last_updated or relevance
 * For example: a search for "halloween",
 * excluding followed sites, using relevance sortwould be
 *   halloween-X-relevance
 * @param  {object} query The feed search action
 * @returns {string} the key
 */
export default function keyBy( query ) {
	const excludeFollowed = query.excludeFollowed ? 'X' : 'A';
	return `${ query.query }-${ excludeFollowed }-${ query.sort }`;
}
