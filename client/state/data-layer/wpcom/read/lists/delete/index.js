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
import { READER_LIST_DELETE } from 'calypso/state/reader/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { navigate } from 'calypso/state/ui/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';

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
			onSuccess: () => {
				return [
					navigate( `/read` ),
					successNotice( translate( 'List deleted successfully.' ), {
						duration: DEFAULT_NOTICE_DURATION,
					} ),
				];
			},
			onError: () => errorNotice( translate( 'Unable to delete list.' ) ),
		} ),
	],
} );
