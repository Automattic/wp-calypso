import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import {
	READER_LIST_ITEM_ADD_FEED,
	READER_LIST_ITEM_DELETE_FEED,
} from 'calypso/state/reader/action-types';
import { receiveAddReaderListFeed } from 'calypso/state/reader/lists/actions';

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
							// Only feed_id or feed_url are supported by this endpoint
							feed_url: action.feedUrl,
							feed_id: action.feedId,
						},
					},
					action
				),
			onSuccess: ( action, apiResponse ) => {
				const defaultSuccessMessage =
					action.listSlug === 'recommended-blogs'
						? translate( 'Recommendation successfully added.' )
						: translate( 'Feed added to list successfully.' );
				// Support custom success messages
				const successMessage = action.successMessage || defaultSuccessMessage;
				return [
					receiveAddReaderListFeed(
						action.listId,
						action.listOwner,
						action.listSlug,
						apiResponse.feed_id
					),
					successNotice( successMessage, {
						duration: action.noticeDuration || DEFAULT_NOTICE_DURATION,
					} ),
				];
			},
			onError: ( action ) => {
				const defaultErrorMessage =
					action.listSlug === 'recommended-blogs'
						? translate( 'Unable to add recommendation.' )
						: translate( 'Unable to add feed to list.' );
				// Support custom error messages
				const errorMessage = action.errorMessage || defaultErrorMessage;
				return [
					errorNotice( errorMessage ),
					// Revert the optimistic add by dispatching a remove action that bypasses the data layer
					bypassDataLayer( {
						type: READER_LIST_ITEM_DELETE_FEED,
						listId: action.listId,
						feedId: action.feedId,
						listOwner: action.listOwner,
						listSlug: action.listSlug,
					} ),
				];
			},
		} ),
	],
} );
