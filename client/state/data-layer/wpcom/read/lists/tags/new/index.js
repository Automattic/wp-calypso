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
import { READER_LIST_ITEM_ADD_TAG } from 'calypso/state/reader/action-types';
import { receiveReaderListAddTag } from 'calypso/state/reader/lists/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';

registerHandlers( 'state/data-layer/wpcom/read/lists/tags/new/index.js', {
	[ READER_LIST_ITEM_ADD_TAG ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/tags/new`,
						apiVersion: '1.2',
						body: {
							tag: action.tagSlug,
						},
					},
					action
				),
			onSuccess: ( action, apiResponse ) => {
				return [
					receiveReaderListAddTag(
						action.listOwner,
						action.listSlug,
						action.tagSlug,
						apiResponse.tagId
					),
					successNotice( translate( 'Tag added to list successfully.' ), {
						duration: DEFAULT_NOTICE_DURATION,
					} ),
				];
			},
			onError: () => errorNotice( translate( 'Unable to add tag to list.' ) ),
		} ),
	],
} );
