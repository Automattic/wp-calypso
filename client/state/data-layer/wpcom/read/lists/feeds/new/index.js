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
import { READER_LIST_ITEM_ADD_FEED } from 'state/reader/action-types';
import { receiveAddReaderListFeed } from 'state/reader/lists/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers( 'state/data-layer/wpcom/read/lists/feeds/new/index.js', {
	[ READER_LIST_ITEM_ADD_FEED ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/feeds/new`,
						apiVersion: '1.2',
						body: {
							// Only one of these will be set
							feed_url: action.feedUrl,
							site_id: action.siteId,
							feed_id: action.feedId,
						},
					},
					action
				),
			onSuccess: ( action, apiResponse ) =>
				receiveAddReaderListFeed(
					action.listId,
					action.listOwner,
					action.listSlug,
					apiResponse.feed_id
				),
			onError: ( action, error ) => {
				return errorNotice(
					translate( 'Could not add feed to list: %(message)s', {
						args: { message: error?.message },
					} )
				);
			},
		} ),
	],
} );
