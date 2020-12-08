/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { READER_LIST_ITEMS_REQUEST } from 'calypso/state/reader/action-types';
import { receiveReaderListItems } from 'calypso/state/reader/lists/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/read/lists/items/index.js', {
	[ READER_LIST_ITEMS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/items`,
						query: { meta: 'site,feed,tag', number: 2000 },
						apiVersion: '1.2',
					},
					action
				),
			onSuccess: ( action, apiResponse ) =>
				receiveReaderListItems( apiResponse.list_ID, apiResponse.items ),
			onError: () => noop,
		} ),
	],
} );
