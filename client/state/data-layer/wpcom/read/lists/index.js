/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { READER_LIST_CREATE } from 'state/reader/action-types';
import { receiveReaderList, handleReaderListRequestFailure } from 'state/reader/lists/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { navigate } from 'state/ui/actions';

registerHandlers( 'state/data-layer/wpcom/read/lists/index.js', {
	[ READER_LIST_CREATE ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/new`,
						apiVersion: '1.2',
						body: {
							title: action.list.title,
							description: action.list.description,
							is_public: action.list.is_public,
						},
					},
					action
				),
			onSuccess: ( action, response ) => [
				receiveReaderList( { list: response.list } ),
				navigate( `/read/list/${ response.list.owner }/${ response.list.slug }/edit` ),
			],
			onError: ( action, error ) => [
				errorNotice( String( error ) ),
				handleReaderListRequestFailure( error ),
			],
		} ),
	],
} );
