import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import {
	READER_LIST_ITEM_DELETE_FEED,
	READER_LIST_ITEM_ADD_FEED,
} from 'calypso/state/reader/action-types';

registerHandlers( 'state/data-layer/wpcom/read/lists/feeds/delete/index.js', {
	[ READER_LIST_ITEM_DELETE_FEED ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/feeds/${ action.feedId }/delete`,
						apiVersion: '1.2',
						body: {},
					},
					action
				),
			onSuccess: ( action ) => {
				const defaultSuccessMessage =
					action.listSlug === 'recommended-blogs'
						? translate( 'Recommendation successfully removed.' )
						: translate( 'Feed removed from list successfully.' );
				// Support custom success messages
				const successMessage = action.successMessage || defaultSuccessMessage;
				return successNotice( successMessage, {
					duration: action.noticeDuration || DEFAULT_NOTICE_DURATION,
				} );
			},
			onError: ( action ) => {
				const defaultErrorMessage =
					action.listSlug === 'recommended-blogs'
						? translate( 'Unable to remove recommendation.' )
						: translate( 'Unable to remove feed from list.' );
				// Support custom error messages
				const errorMessage = action.errorMessage || defaultErrorMessage;
				return [
					errorNotice( errorMessage ),
					// Revert the optimistic remove by dispatching an add action that bypasses the data layer
					bypassDataLayer( {
						type: READER_LIST_ITEM_ADD_FEED,
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
