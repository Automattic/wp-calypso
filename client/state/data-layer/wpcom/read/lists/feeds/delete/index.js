/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	READER_LIST_ITEM_DELETE_FEED,
	READER_LIST_ITEM_DELETE_SITE,
} from 'calypso/state/reader/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

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
			onError: () => errorNotice( translate( 'Unable to remove feed from list' ) ),
		} ),
	],
	[ READER_LIST_ITEM_DELETE_SITE ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/feeds/site:${ action.siteId }/delete`,
						apiVersion: '1.2',
						body: {},
					},
					action
				),
			onError: () => errorNotice( translate( 'Unable to remove site from list' ) ),
		} ),
	],
} );
