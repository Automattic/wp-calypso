/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
	PLANS_REQUEST_FAILURE
} from 'state/action-types';

export const requestPlans = ( { dispatch } ) => () => (
	wpcom
		.withLocale()
		.plans()
		.list( { apiVersion: '1.4' } )
		.then( plans => {
			dispatch( { type: PLANS_REQUEST_SUCCESS } );
			dispatch( { type: PLANS_RECEIVE, plans } );
		} )
		.catch( rawError => {
			const error = rawError instanceof Error
				? rawError.message
				: rawError;

			dispatch( { type: PLANS_REQUEST_FAILURE, error } );
		} )
);

export default [ PLANS_REQUEST, requestPlans ];
