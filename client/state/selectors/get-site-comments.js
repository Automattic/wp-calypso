/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns list of loaded comments for a given site
 *
 * @param {Object} state Redux state
 * @param {Number} siteId site for whose comments to find
 * @returns {Array<Object>} available comments for site
 */
export const getCommentsForSite = ( state, siteId ) => {
	const comments = get( state, 'comments.items', {} );

	return Object.keys( comments )
		.filter( key => parseInt( key.split( '-', 1 ), 10 ) === siteId )
		.reduce( ( list, key ) => [ ...list, ...comments[ key ] ], [] );
};

export default getCommentsForSite;
