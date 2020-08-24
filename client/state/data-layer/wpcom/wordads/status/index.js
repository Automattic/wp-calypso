/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { WORDADS_STATUS_REQUEST } from 'state/action-types';
import { receiveStatus } from 'state/wordads/status/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/wordads/status/index.js', {
	[ WORDADS_STATUS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/sites/${ action.siteId }/wordads/account`,
					},
					action
				),
			onSuccess: ( { siteId }, status ) => receiveStatus( siteId, status ),
			onError: ( action, error ) => errorNotice( error ),
		} ),
	],
} );
