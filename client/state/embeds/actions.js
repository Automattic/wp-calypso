/**
 * Internal dependencies
 */
import { EMBED_RECEIVE, EMBED_REQUEST, EMBEDS_RECEIVE, EMBEDS_REQUEST } from 'state/action-types';
import 'state/data-layer/wpcom/sites/embeds';

/**
 * Returns an action object used in signalling that an embed item for the site
 * has been requested.
 *
 * @param   {number} siteId Site ID
 * @param   {string} url    Embed URL
 * @returns {object}        Action object
 */
export function requestEmbed( siteId, url ) {
	return {
		type: EMBED_REQUEST,
		siteId,
		url,
	};
}

/**
 * Returns an action object used in signalling that an embed item for the site
 * has been received.
 *
 * @param   {number} siteId Site ID
 * @param   {string} url    Embed URL
 * @param   {object} embed  Embed data
 * @returns {object}        Action object
 */
export function receiveEmbed( siteId, url, embed ) {
	return {
		type: EMBED_RECEIVE,
		siteId,
		url,
		embed,
	};
}

/**
 * Returns an action object used in signalling that all embeds for the site
 * have been requested.
 *
 * @param   {number} siteId Site ID
 * @returns {object}        Action object
 */
export function requestEmbeds( siteId ) {
	return {
		type: EMBEDS_REQUEST,
		siteId,
	};
}

/**
 * Returns an action object used in signalling that all embeds for the site
 * have been received.
 *
 * @param   {number} siteId Site ID
 * @param   {Array}  embeds Embed items
 * @returns {object}        Action object
 */
export function receiveEmbeds( siteId, embeds ) {
	return {
		type: EMBEDS_RECEIVE,
		siteId,
		embeds,
	};
}
