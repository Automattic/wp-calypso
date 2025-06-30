import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import { READER_LIST_ITEM_ADD_SITE } from 'calypso/state/reader/action-types';
import { receiveAddReaderListSite } from 'calypso/state/reader/lists/actions';

registerHandlers( 'state/data-layer/wpcom/read/lists/sites/new/index.js', {
	[ READER_LIST_ITEM_ADD_SITE ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/sites/new`,
						apiVersion: '1.2',
						body: {
							site_id: action.siteId,
						},
					},
					action
				),
			onSuccess: ( action, apiResponse ) => {
				// Support custom success messages
				const successMessage =
					action.successMessage || translate( 'Site added to list successfully.' );
				return [
					receiveAddReaderListSite(
						action.listId,
						action.listOwner,
						action.listSlug,
						apiResponse.site_id || action.siteId
					),
					successNotice( successMessage, {
						duration: action.noticeDuration || DEFAULT_NOTICE_DURATION,
					} ),
				];
			},
			onError: ( action ) => {
				// Support custom error messages
				const errorMessage = action.errorMessage || translate( 'Unable to add site to list.' );
				return [
					errorNotice( errorMessage ),
					{
						type: 'READER_LIST_ITEM_ADD_SITE_ERROR',
						listId: action.listId,
						siteId: action.siteId,
						listOwner: action.listOwner,
						listSlug: action.listSlug,
					},
				];
			},
		} ),
	],
} );
