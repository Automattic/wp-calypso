/**
 * Internal dependencies
 */
import { WORDADS_EARNINGS_REQUEST, WORDADS_EARNINGS_RECEIVE } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/wordads/earnings';
import 'calypso/state/wordads/init';

export const requestWordadsEarnings = ( siteId ) => ( {
	type: WORDADS_EARNINGS_REQUEST,
	siteId,
} );

export const receiveEarnings = ( siteId, earnings ) => ( {
	type: WORDADS_EARNINGS_RECEIVE,
	siteId,
	earnings,
} );
