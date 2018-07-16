/** @format */

/**
 * Internal dependencies
 */

import { WORDADS_STATS_REQUEST, WORDADS_STATS_RECEIVE } from 'state/action-types';

export const requestWordadsStats = siteId => ( {
	type: WORDADS_STATS_REQUEST,
	siteId,
} );

export const receiveStats = ( siteId, stats ) => ( {
	type: WORDADS_STATS_RECEIVE,
	siteId,
	stats,
} );
