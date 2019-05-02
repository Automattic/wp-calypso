/**
 * Internal dependencies
 */
import { requestHttpData } from 'state/data-layer/http-data';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

/**
 * Request a site's frame nonce from the v1.3 endpoint.
 *
 * @param {number} siteId  Site Id.
 * @return {*} Stored data container for request.
 */
export const getFrameNonce = siteId =>
	requestHttpData(
		`frame-nonce-${ siteId }`,
		http( {
			type: WPCOM_HTTP_REQUEST,
			method: 'GET',
			path: `/sites/${ siteId }`,
			apiVersion: '1.3',
		} ),
		{
			fromApi: () => {},
			freshness: 0,
		}
	);
