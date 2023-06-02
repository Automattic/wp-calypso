import { WORDADS_PAYMENTS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { receivePayments } from 'calypso/state/wordads/payments/actions';

registerHandlers( 'state/data-layer/wpcom/wordads/payments/index.js', {
	[ WORDADS_PAYMENTS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/sites/${ action.siteId }/wordads/payments`,
						apiNamespace: 'wpcom/v2',
					},
					action
				),
			onSuccess: ( { siteId }, { payments } ) => receivePayments( siteId, payments ),
			onError: ( action, error ) => errorNotice( error ),
		} ),
	],
} );
