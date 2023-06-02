import { WORDADS_PAYMENTS_REQUEST, WORDADS_PAYMENTS_RECEIVE } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/wordads/payments';
import 'calypso/state/wordads/init';

export const requestWordadsPayments = ( siteId ) => ( {
	type: WORDADS_PAYMENTS_REQUEST,
	siteId,
} );

export const receivePayments = ( siteId, payments ) => ( {
	type: WORDADS_PAYMENTS_RECEIVE,
	siteId,
	payments,
} );
