/**
 * Internal dependencies
 */

import wpcomBase from 'lib/wp';
import { injectHandler } from 'lib/wp/handlers/http-envelope-normalizer';
import {
	SITE_VOUCHERS_ASSIGN_RECEIVE,
	SITE_VOUCHERS_ASSIGN_REQUEST,
	SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS,
	SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
	SITE_VOUCHERS_RECEIVE,
	SITE_VOUCHERS_REQUEST,
	SITE_VOUCHERS_REQUEST_SUCCESS,
	SITE_VOUCHERS_REQUEST_FAILURE,
} from 'state/action-types';

// Inject httpEnvelopeNormalizer handler to wpcom
const wpcom = injectHandler( wpcomBase );

/**
 * Action creator function
 *
 * Returns an action object to be used in signalling that
 * an object containing the vouchers for
 * a given site have been received.
 *
 * @param {number} siteId - identifier of the site
 * @param {object} vouchers - vouchers array gotten from WP REST-API response
 * @returns {object} the action object
 */
export const vouchersReceiveAction = ( siteId, vouchers ) => ( {
	type: SITE_VOUCHERS_RECEIVE,
	siteId,
	vouchers,
} );

/**
 * Action creator function
 *
 * Return SITE_VOUCHERS_REQUEST action object
 *
 * @param {number} siteId - side identifier
 * @returns {object} siteId - action object
 */
export const vouchersRequestAction = ( siteId ) => ( {
	type: SITE_VOUCHERS_REQUEST,
	siteId,
} );

export const vouchersRequestSuccessAction = ( siteId ) => ( {
	type: SITE_VOUCHERS_REQUEST_SUCCESS,
	siteId,
} );

export const vouchersRequestFailureAction = ( siteId, error ) => ( {
	type: SITE_VOUCHERS_REQUEST_FAILURE,
	siteId,
	error,
} );

export const vouchersAssignReceiveAction = ( siteId, serviceType, voucher ) => ( {
	type: SITE_VOUCHERS_ASSIGN_RECEIVE,
	siteId,
	serviceType,
	voucher,
} );

export const vouchersAssignRequestAction = ( siteId, serviceType ) => {
	return {
		type: SITE_VOUCHERS_ASSIGN_REQUEST,
		siteId,
		serviceType,
	};
};

export const vouchersAssignRequestSuccessAction = ( siteId, serviceType ) => ( {
	type: SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS,
	siteId,
	serviceType,
} );

export const vouchersAssignRequestFailureAction = ( siteId, serviceType, error ) => ( {
	type: SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
	siteId,
	serviceType,
	error,
} );

/**
 * Fetches vouchers for the given site.
 *
 * @param {number} siteId - identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function requestSiteVouchers( siteId ) {
	return ( dispatch ) => {
		dispatch( vouchersRequestAction( siteId ) );

		return wpcom
			.site( siteId )
			.creditVouchers()
			.list()
			.then( ( data ) => {
				const { vouchers = [] } = data;
				dispatch( vouchersRequestSuccessAction( siteId ) );
				dispatch( vouchersReceiveAction( siteId, vouchers ) );
			} )
			.catch( ( error ) => {
				const message = error instanceof Error ? error.message : error;

				dispatch( vouchersRequestFailureAction( siteId, message ) );
			} );
	};
}

/**
 * Assign a voucher to the given site.
 *
 * @param {number} siteId - identifier of the site
 * @param {string} serviceType - service type supported: 'google-credits', etc.
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function assignSiteVoucher( siteId, serviceType ) {
	return ( dispatch ) => {
		dispatch( vouchersAssignRequestAction( siteId, serviceType ) );

		return wpcom
			.site( siteId )
			.creditVouchers()
			.assign( serviceType )
			.then( ( data ) => {
				const { voucher = {} } = data;
				dispatch( vouchersAssignRequestSuccessAction( siteId, serviceType ) );
				dispatch( vouchersAssignReceiveAction( siteId, serviceType, voucher ) );
			} )
			.catch( ( error ) => {
				const message = error instanceof Error ? error.message : error;

				dispatch( vouchersAssignRequestFailureAction( siteId, serviceType, message ) );
			} );
	};
}
