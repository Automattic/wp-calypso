/**
 * Internal dependencies
 */
import {
	EXTERNAL_CONTRIBUTORS_GET_REQUEST,
	// EMAIL_FORWARDING_ADD_REQUEST,
	// EMAIL_FORWARDING_REMOVE_REQUEST,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveGetExternalContributorsSuccess,
	receiveGetExternalContributorsFailure,
} from 'state/sites/external-contributors/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/sites/external-contributors/index.js', {
	[ EXTERNAL_CONTRIBUTORS_GET_REQUEST ]: [
		dispatchRequest( {
			fetch: action =>
				http(
					{
						method: 'GET',
						path: `/sites/${ action.siteId }/external-contributors`,
						apiNamespace: 'wpcom/v2',
					},
					action
				),
			onSuccess: ( { siteId }, response ) =>
				receiveGetExternalContributorsSuccess( siteId, response ),
			onError: ( { siteId }, error ) => receiveGetExternalContributorsFailure( siteId, error ),
		} ),
	],
} );
