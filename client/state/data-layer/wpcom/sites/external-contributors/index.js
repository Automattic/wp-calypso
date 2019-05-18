/**
 * Internal dependencies
 */
// import { EDITOR_TYPE_REQUEST, EDITOR_TYPE_SET } from 'state/action-types';
// TODO: move to action types
const EXTERNAL_CONTRIBUTORS_GET_REQUEST = 'GET_EXTERNAL_CONTRIBUTORS_REQUEST';
// const GET_EXTERNAL_CONTRIBUTORS_REQUEST_SUCCESS = 'GET_EXTERNAL_CONTRIBUTORS_REQUEST_SUCCESS';
// const GET_EXTERNAL_CONTRIBUTORS_REQUEST_FAILURE = 'GET_EXTERNAL_CONTRIBUTORS_REQUEST_FAILURE';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveGetExternalContributorsSuccess,
	receiveGetExternalContributorsFailure,
} from 'state/external-contributors/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/sites/external-contributors/index.js', {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: [
		dispatchRequest( {
			fetch: action =>
				http(
					{
						method: 'GET',
						path: `/sites/${ action.siteId }/external-contributors`,
					},
					action
				),
			onSuccess: ( { siteId }, response ) =>
				receiveGetExternalContributorsSuccess( siteId, response ),
			onError: ( { siteId }, error ) => receiveGetExternalContributorsFailure( siteId, error ),
		} ),
	],
} );
