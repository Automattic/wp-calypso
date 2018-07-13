/** @format */

/**
 * Internal dependencies
 */

import { WORDADS_EARNINGS_REQUEST, WORDADS_EARNINGS_REQUEST_RECEIVE } from 'state/action-types';

export const requestWordadsEarnings = siteId => dispatch => {
	dispatch( {
		type: WORDADS_EARNINGS_REQUEST,
		siteId,
	} );
};

export const receiveEarnings = ( siteId, earnings ) => dispatch => {
	dispatch( {
		type: WORDADS_EARNINGS_REQUEST_RECEIVE,
		siteId,
		earnings: earnings,
	} );
};
