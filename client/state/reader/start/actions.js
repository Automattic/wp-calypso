/**
 * External dependencies
 */
import map from 'lodash/map';
import omit from 'lodash/omit';
import property from 'lodash/property';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_START_RECOMMENDATIONS_RECEIVE,
	READER_START_RECOMMENDATIONS_REQUEST,
	READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
	READER_START_RECOMMENDATIONS_REQUEST_FAILURE
} from 'state/action-types';
import { updateSites } from 'state/reader/sites/actions';
import { receivePosts } from 'state/reader/posts/actions';

/**
 * Returns an action object to signal that recommendation objects have been received.
 *
 * @param  {Array}  recommendations Recommendations received
 * @return {Object} Action object
 */
export function receiveRecommendations( recommendations ) {
	return {
		type: READER_START_RECOMMENDATIONS_RECEIVE,
		recommendations
	};
}

/**
 * Triggers a network request to fetch recommendations.
 *
 * @return {Function}        Action thunk
 */
export function requestRecommendations() {
	return ( dispatch ) => {
		dispatch( {
			type: READER_START_RECOMMENDATIONS_REQUEST,
		} );

		return wpcom.undocumented().readRecommendationsStart( { meta: 'site,post' } )
			.then( ( data ) => {
				// Collect sites and posts from meta, and receive them separately
				const sites = map( data.recommendations, property( 'meta.data.site' ) );
				const posts = map( data.recommendations, property( 'meta.data.post' ) );
				dispatch( updateSites( sites ) );
				dispatch( receivePosts( posts ) );

				// Trim meta off before receiving recommendations
				const recommendations = map( data.recommendations, ( recommendation ) => {
					return omit( recommendation, 'meta' );
				} );

				dispatch( receiveRecommendations( recommendations ) );

				dispatch( {
					type: READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
					data
				} );
			},
			( error ) => {
				dispatch( {
					type: READER_START_RECOMMENDATIONS_REQUEST_FAILURE,
					error
				} );
			}
		);
	};
}
