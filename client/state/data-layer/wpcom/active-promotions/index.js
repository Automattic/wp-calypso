import { ACTIVE_PROMOTIONS_REQUEST } from 'calypso/state/action-types';
import {
	activePromotionsReceiveAction,
	activePromotionsRequestFailureAction,
	activePromotionsRequestSuccessAction,
} from 'calypso/state/active-promotions/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

/**
 * @module state/data-layer/wpcom/active-promotions
 */

/**
 * Dispatches a request to fetch all available active promotions
 *
 * @param {Object} action Redux action
 * @returns {Object} original action
 */
export const requestActivePromotions = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/me/active-promotions',
		},
		action
	);

/**
 * Dispatches returned WordPress.com active promotions data
 *
 * @param {Object} action Redux action
 * @param {Object} obj
 * @param {Array} obj.active_promotions raw data from active promotions API
 * @returns {Array<Object>} Redux actions
 */
export const receiveActivePromotions = ( action, { active_promotions } ) => [
	activePromotionsRequestSuccessAction(),
	activePromotionsReceiveAction( active_promotions ),
];

/**
 * Dispatches returned error from active promotions request
 *
 * @param {Object} action Redux action
 * @param {Object} rawError raw error from HTTP request
 * @returns {Object} Redux action
 */
export const receiveError = ( action, rawError ) =>
	activePromotionsRequestFailureAction( rawError instanceof Error ? rawError.message : rawError );

export const dispatchActivePromotionsRequest = dispatchRequest( {
	fetch: requestActivePromotions,
	onSuccess: receiveActivePromotions,
	onError: receiveError,
} );

registerHandlers( 'state/data-layer/wpcom/active-promotions/index.js', {
	[ ACTIVE_PROMOTIONS_REQUEST ]: [ dispatchActivePromotionsRequest ],
} );
