/**
 * Returns true if a site is known to be blocked
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether specified site is blocked
 */
export default function isSiteBlocked( state, siteId ) {
	return !! state.reader.siteBlocks.items[ siteId ];
}
