/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { READER_LIST_ITEM_DELETE_TAG } from 'state/reader/action-types';
import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/read/lists/tags/delete/index.js', {
	[ READER_LIST_ITEM_DELETE_TAG ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/tags/${ action.tagSlug }/delete`,
						apiVersion: '1.2',
						body: {},
					},
					action
				),
			onError: () => errorNotice( translate( 'Unable to remove tag from list' ) ),
		} ),
	],
} );
