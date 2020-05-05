/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { ACTIVE_PROMOTIONS_REQUEST } from 'state/action-types';
import {
	activePromotionsReceiveAction,
	activePromotionsRequestFailureAction,
	activePromotionsRequestSuccessAction,
} from 'state/active-promotions/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * @module state/data-layer/wpcom/active-promotions
 */

/**
 * Dispatches a request to fetch all available active promotions
 *
 * @param {object} action Redux action
 * @returns {object} original action
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
 * @param {object} action Redux action
 * @param {Array} active_promotions raw data from active promotions API
 * @returns {Array<object>} Redux actions
 */
export const receiveActivePromotions = ( action, { active_promotions } ) => [
	activePromotionsRequestSuccessAction(),
	activePromotionsReceiveAction( active_promotions ),
];

/**
 * Dispatches returned error from active promotions request
 *
 * @param {object} action Redux action
 * @param {object} rawError raw error from HTTP request
 * @returns {object} Redux action
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
