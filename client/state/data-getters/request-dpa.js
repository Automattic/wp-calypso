/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';

function requestDpa( requestId ) {
	requestHttpData(
		requestId,
		http( {
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: '/me/request-dpa',
		} ),
		{
			freshness: -Infinity, // we want to allow the user to re-request
			fromApi: () => () => [ [ requestId, true ] ],
		}
	);
}

export default requestDpa;
