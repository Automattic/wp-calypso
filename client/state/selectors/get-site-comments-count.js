/**
 * External dependencies
 */
import { get } from 'lodash';

export const getSiteCommentsCount = ( state, siteId, status = 'unapproved' ) => get( state.comments, [ 'counts', siteId, status ] );

export default getSiteCommentsCount;
