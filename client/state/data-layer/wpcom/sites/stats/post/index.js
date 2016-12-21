/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_START,
	POST_STATS_REQUEST_SUCCESS,
	POST_STATS_REQUEST_FAILURE
} from 'state/action-types';
import { receivePostStat } from 'state/stats/posts/actions';

export const requestPostStat = ( { dispatch }, { stat, siteId, postId } ) => {
	dispatch( {
		type: POST_STATS_REQUEST_START,
		stat,
		postId,
		siteId
	} );

	return wpcom.site( siteId ).statsPostViews( postId, {
		fields: stat
	} ).then( data => {
		if ( stat in data ) {
			dispatch( receivePostStat( stat, siteId, postId, data[ stat ] ) );
		}
		dispatch( {
			type: POST_STATS_REQUEST_SUCCESS,
			stat,
			siteId,
			postId
		} );
	} ).catch( error => {
		dispatch( {
			type: POST_STATS_REQUEST_FAILURE,
			stat,
			siteId,
			postId,
			error
		} );
	} );
};

export default  {
	[ POST_STATS_REQUEST ]: [ requestPostStat ],
};

