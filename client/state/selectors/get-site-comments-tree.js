/**
 * External dependencies
 */
import { filter, get } from 'lodash';

export const getSiteCommentsTree = ( state, siteId, status ) => {
	const siteTree = get( state, [ 'comments', 'trees', siteId ] );
	return status
		? filter( siteTree, { status } )
		: siteTree;
};

export default getSiteCommentsTree;
