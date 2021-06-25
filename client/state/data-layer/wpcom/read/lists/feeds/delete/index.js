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
import { READER_LIST_ITEM_DELETE_FEED } from 'calypso/state/reader/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';

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
			onSuccess: () =>
				successNotice( translate( 'Feed removed from list successfully.' ), {
					duration: DEFAULT_NOTICE_DURATION,
				} ),
			onError: () => errorNotice( translate( 'Unable to remove feed from list.' ) ),
		} ),
	],
} );
