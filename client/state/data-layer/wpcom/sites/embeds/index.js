/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import renderEmbed from './render';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { EMBEDS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { mergeHandlers } from 'state/action-watchers/utils';
import { receiveEmbeds } from 'state/embeds/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Picks the embeds from the API endpoint response.
 *
 * @param   {object} response API response
 * @returns {Array}           Array of embeds.
 */
const fromApi = ( response ) => response.embeds || [];

/**
 * Dispatches a request to fetch all embeds for a given site.
 *
 * @param   {object} action Redux action
 * @returns {object}        Dispatched http action
 */
const requestEmbeds = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/sites/' + action.siteId + '/embeds',
		},
		action
	);

/**
 * Success handler after successfully fetching all embeds for a given site.
 *
 * @param   {object} action Redux action
 * @param   {Array}  embeds All embeds of that site
 * @returns {object}        Dispatched http action
 */
const receiveAllEmbeds = ( { siteId }, embeds ) => receiveEmbeds( siteId, embeds );

const embedsHandler = {
	[ EMBEDS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestEmbeds,
			onSuccess: receiveAllEmbeds,
			onError: noop,
			fromApi,
		} ),
	],
};

registerHandlers(
	'state/data-layer/wpcom/sites/embeds/index.js',
	mergeHandlers( embedsHandler, renderEmbed )
);
