/** @format */

/**
 * Internal dependencies
 */
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_RECEIVE,
	EMAIL_FORWARDING_FAILURE,
} from 'state/action-types';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

/**
 * Triggers a network request to fetch posts for the specified site and query.
 *
 * @param  {String}   domainName  domainName
 * @return {Function}        Action thunk
 */
export const requestEmailForwarding = domainName => {
	return dispatch => {
		dispatch( {
			type: EMAIL_FORWARDING_REQUEST,
			domainName,
		} );

		return wpcom
			.getEmailForwards( domainName )
			.then( data => {
				dispatch( {
					type: EMAIL_FORWARDING_RECEIVE,
					domainName,
					data,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: EMAIL_FORWARDING_FAILURE,
					domainName,
					error,
				} );
			} );
	};
};
