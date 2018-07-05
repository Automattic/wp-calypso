/** @format */

/**
 * Internal dependencies
 */
import {
	NPS_SURVEY_CHECK_ELIGIBILITY,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { setNpsSurveyEligibility } from 'state/nps-survey/actions';

export const fetchSurveyEligibility = action => ( dispatch, getState ) => {

	dispatch(
		http(
			{
				method: 'GET',
				path: `/nps/`,
				apiVersion: '1.2',
				} ),
			}
		)
	);
};

// @todo this needs to get "data" returned somehow from the API call
export const handleSuccess = ( action, {} ) => {
	debug( '...Eligibility returned from endpoint.', data );
	dispatch( setNpsSurveyEligibility( data.display_survey ) );

	// const receiveAction = {
	// 	type: COMMENTS_RECEIVE,
	// 	siteId,
	// 	postId,
	// 	comments: commentsFromApi( comments ),
	// 	direction,
	// };

	// if the api have returned comments count, dispatch it
	// the api will produce a count only when the request has no
	// query modifiers such as 'before', 'after', 'type' and more.
	// in our case it'll be only on the first request
	// if ( found > -1 ) {
	// 	return [
	// 		receiveAction,
	// 		{
	// 			type: COMMENTS_COUNT_RECEIVE,
	// 			siteId,
	// 			postId,
	// 			totalCommentsCount: found,
	// 		},
	// 	];
	// }

	// return receiveAction;
};

// @todo this needs to get "err" from API call somehow
export const handleFailure = action => {
	debug( '...Error querying NPS survey eligibility.', err );
	dispatch( setNpsSurveyEligibility( false ) );
};

export default {
	[ NPS_SURVEY_CHECK_ELIGIBILITY ]: [
		dispatchRequestEx( {
			fetch: fetchSurveyEligibility,
			onSuccess: saveSurveyEligibility,
			onError: handleFailure,
		} ),
	],
};
