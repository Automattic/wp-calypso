/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { WORDADS_STATUS_REQUEST } from 'calypso/state/action-types';
import { receiveStatus } from 'calypso/state/wordads/status/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

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
