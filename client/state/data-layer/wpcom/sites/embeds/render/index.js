/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { EMBED_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveEmbed } from 'state/embeds/actions';

/**
 * Dispatches a request to fetch a particular embed for a given site.
 *
 * @param   {object} action Redux action
 * @returns {object}        Dispatched http action
 */
const requestEmbed = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/sites/' + action.siteId + '/embeds/render',
			query: {
				embed_url: action.url,
				force: 'wpcom',
			},
		},
		action
	);

/**
 * Success handler after successfully fetching a particular embed for a given site.
 *
 * @param   {object} action Redux action
 * @param   {object} embed  Embed data
 * @returns {object}        Dispatched http action
 */
const receiveSingleEmbed = ( { siteId, url }, embed ) => receiveEmbed( siteId, url, embed );

const renderEmbedHandler = {
	[ EMBED_REQUEST ]: [
		dispatchRequest( {
			fetch: requestEmbed,
			onSuccess: receiveSingleEmbed,
			onError: noop,
		} ),
	],
};

export default renderEmbedHandler;
