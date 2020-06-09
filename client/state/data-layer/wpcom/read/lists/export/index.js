/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { READER_LIST_EXPORT_REQUEST } from 'state/reader/action-types';
import { receiveReaderListExport } from 'state/reader/lists/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/read/lists/export/index.js', {
	[ READER_LIST_EXPORT_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						apiNamespace: 'wpcom/v2',
						method: 'GET',
						path: `/read/lists/${ action.listId }/export`,
					},
					action
				),
			onSuccess: ( action, { listId, listExport } ) =>
				receiveReaderListExport( listId, listExport ),
			onError: ( action, error ) => errorNotice( error ),
		} ),
	],
} );
