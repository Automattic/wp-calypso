import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import { READER_LIST_DELETE } from 'calypso/state/reader/action-types';

registerHandlers( 'state/data-layer/wpcom/read/lists/delete/index.js', {
	[ READER_LIST_DELETE ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/delete`,
						apiVersion: '1.2',
						body: {},
					},
					action
				),
			onSuccess: () => [
				() => page( `/reader` ),
				successNotice( translate( 'List deleted successfully.' ), {
					duration: DEFAULT_NOTICE_DURATION,
				} ),
			],
			onError: () => errorNotice( translate( 'Unable to delete list.' ) ),
		} ),
	],
} );
