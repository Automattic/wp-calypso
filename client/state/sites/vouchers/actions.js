/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_VOUCHERS_RECEIVE,
	SITE_VOUCHERS_REQUEST,
	SITE_VOUCHERS_REQUEST_SUCCESS,
	SITE_VOUCHERS_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Action creator function
 *
 * Returns an action object to be used in signalling that
 * an object containing the vouchers for
 * a given site have been received.
 *
 * @param {Number} siteId - identifier of the site
 * @param {Object} vouchers - vouchers array gotten from WP REST-API response
 * @returns {Object} the action object
 */
export const vouchersReceiveAction = ( siteId, vouchers ) => {
	return {
		type: SITE_VOUCHERS_RECEIVE,
		siteId,
		vouchers
	};
};

/**
 * Action creator function
 *
 * Return SITE_VOUCHERS_REQUEST action object
 *
 * @param {Number} siteId - side identifier
 * @return {Object} siteId - action object
 */
export const vouchersRequestAction = siteId => {
	return {
		type: SITE_VOUCHERS_REQUEST,
		siteId
	};
};

/**
 * Action creator function
 *
 * Return SITE_VOUCHERS_REQUEST_SUCCESS action object
 *
 * @param {Number} siteId - side identifier
 * @return {Object} siteId - action object
 */
export const vouchersRequestSuccessAction = siteId => {
	return {
		type: SITE_VOUCHERS_REQUEST_SUCCESS,
		siteId
	};
};

/**
 * Action creator function
 *
 * Return SITE_VOUCHERS_REQUEST_FAILURE action object
 *
 * @param {Number} siteId - site identifier
 * @param {Object} error - error message according to REST-API error response
 * @return {Object} action object
 */
export const vouchersRequestFailureAction = ( siteId, error ) => {
	return {
		type: SITE_VOUCHERS_REQUEST_FAILURE,
		siteId,
		error
	};
};

/**
 * Fetches vouchers for the given site.
 *
 * @param {Number} siteId - identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function requestSiteVouchers( siteId ) {
	return dispatch => {
		dispatch( vouchersRequestAction( siteId ) );

		return wpcom
			.site( siteId )
			.adCreditVouchers()
			.list()
			.then( data => {
				const { vouchers = [] } = data;
				dispatch( vouchersRequestSuccessAction( siteId ) );
				dispatch( vouchersReceiveAction( siteId, vouchers ) );
			} )
			.catch( error => {
				const message = error instanceof Error
					? error.message
					: error;

				dispatch( vouchersRequestFailureAction( siteId, message ) );
			} );
	};
}
