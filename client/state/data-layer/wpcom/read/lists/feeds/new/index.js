/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { READER_LIST_ITEM_ADD_FEED } from 'calypso/state/reader/action-types';
import { receiveAddReaderListFeed } from 'calypso/state/reader/lists/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';

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
			onSuccess: ( action, apiResponse ) => {
				return [
					receiveAddReaderListFeed(
						action.listId,
						action.listOwner,
						action.listSlug,
						apiResponse.feed_id
					),
					successNotice( translate( 'Feed added to list successfully.' ), {
						duration: DEFAULT_NOTICE_DURATION,
					} ),
				];
			},
			onError: () => {
				return errorNotice( translate( 'Unable to add feed to list.' ) );
			},
		} ),
	],
} );
