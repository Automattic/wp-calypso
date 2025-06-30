import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import { READER_LIST_ITEM_DELETE_SITE } from 'calypso/state/reader/action-types';
import { receiveAddReaderListSite } from 'calypso/state/reader/lists/actions';

registerHandlers( 'state/data-layer/wpcom/read/lists/sites/delete/index.js', {
	[ READER_LIST_ITEM_DELETE_SITE ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/sites/${ action.siteId }/delete`,
						apiVersion: '1.2',
						body: {},
					},
					action
				),
			onSuccess: ( action ) => {
				// Support custom success messages
				const successMessage =
					action.successMessage || translate( 'Site removed from list successfully.' );
				return successNotice( successMessage, {
					duration: action.noticeDuration || DEFAULT_NOTICE_DURATION,
				} );
			},
			onError: ( action ) => {
				// Support custom error messages
				const errorMessage = action.errorMessage || translate( 'Unable to remove site from list.' );
				return [
					// Revert the optimistic removal by adding the site back to the list
					bypassDataLayer(
						receiveAddReaderListSite(
							action.listId,
							action.listOwner,
							action.listSlug,
							action.siteId
						)
					),
					errorNotice( errorMessage ),
					{
						type: 'READER_LIST_ITEM_DELETE_SITE_ERROR',
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
