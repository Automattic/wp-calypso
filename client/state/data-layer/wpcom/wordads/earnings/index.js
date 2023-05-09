import { WORDADS_EARNINGS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { receiveEarnings } from 'calypso/state/wordads/earnings/actions';

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
