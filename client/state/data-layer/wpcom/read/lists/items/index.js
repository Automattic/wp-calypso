/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { READER_LIST_ITEMS_REQUEST } from 'state/reader/action-types';
import { receiveReaderListItems } from 'state/reader/lists/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/read/lists/items/index.js', {
	[ READER_LIST_ITEMS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/items`,
						query: { meta: 'site,feed,tag' },
						apiVersion: '1.2',
					},
					action
				),
			onSuccess: ( action, apiResponse ) =>
				receiveReaderListItems( apiResponse.list_ID, apiResponse.items ),
			onError: ( action, error ) => errorNotice( error ),
		} ),
	],
} );
