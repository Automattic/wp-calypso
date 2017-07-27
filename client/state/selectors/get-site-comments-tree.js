/**
 * External dependencies
 */
import { get } from 'lodash';

export const getSiteCommentsTree = ( state, siteId, status = 'unapproved' ) => get( state.comments, [ 'trees', siteId, status ], {} );

export default getSiteCommentsTree;
