/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { WORDADS_EARNINGS_REQUEST } from 'state/action-types';
import { receiveEarnings } from 'state/wordads/earnings/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/wordads/earnings/index.js', {
	[ WORDADS_EARNINGS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/sites/${ action.siteId }/wordads/earnings`,
					},
					action
				),
			onSuccess: ( { siteId }, { earnings } ) => receiveEarnings( siteId, earnings ),
			onError: ( action, error ) => errorNotice( error ),
		} ),
	],
} );
