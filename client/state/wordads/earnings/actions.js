/**
 * Internal dependencies
 */

import { WORDADS_EARNINGS_REQUEST, WORDADS_EARNINGS_RECEIVE } from 'state/action-types';

import 'state/data-layer/wpcom/wordads/earnings';

export const requestWordadsEarnings = ( siteId ) => ( {
	type: WORDADS_EARNINGS_REQUEST,
	siteId,
} );

export const receiveEarnings = ( siteId, earnings ) => ( {
	type: WORDADS_EARNINGS_RECEIVE,
	siteId,
	earnings,
} );
