/**
 * Internal dependencies
 */
import {
	POST_STATS_REQUEST,
	POST_STATS_REQUEST_START,
	POST_STATS_REQUEST_SUCCESS,
	POST_STATS_REQUEST_FAILURE
} from 'state/action-types';
import { receivePostStat } from 'state/stats/posts/actions';
import batch from 'state/data-layer/wpcom/batch';

export const requestPostStat = ( { dispatch }, { stat, siteId, postId } ) => {
	dispatch( {
		type: POST_STATS_REQUEST_START,
		stat,
		postId,
		siteId
	} );

	const path = `/sites/${ siteId }/stats/post/${ postId }?fields=${ stat }`;
	return batch.request( path ).then( data => {
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

export default {
	[ POST_STATS_REQUEST ]: [ requestPostStat ],
};

