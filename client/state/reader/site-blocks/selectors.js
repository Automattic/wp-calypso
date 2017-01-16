/**
 * Returns true if a site is known to be blocked
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  tag 	Tag
 * @return {Boolean} Is the specified site blocked?
 */
export function isSiteBlocked( state, siteId ) {
	return !! state.reader.siteBlocks.items[ siteId ];
}

