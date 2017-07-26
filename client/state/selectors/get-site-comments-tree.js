/**
 * External dependencies
 */
import { get } from 'lodash';

export const getSiteCommentsTree = ( state, siteId ) => get( state.comments, [ 'trees', siteId ], {} );

export default getSiteCommentsTree;
