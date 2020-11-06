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
import {
	READER_LIST_CREATE,
	READER_LIST_FOLLOW,
	READER_LIST_REQUEST,
	READER_LIST_UNFOLLOW,
	READER_LIST_UPDATE,
	READER_LISTS_REQUEST,
} from 'calypso/state/reader/action-types';
import {
	handleReaderListRequestFailure,
	handleUpdateListDetailsError,
	receiveFollowList,
	receiveLists,
	receiveUnfollowList,
	receiveReaderList,
	receiveUpdatedListDetails,
} from 'calypso/state/reader/lists/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { navigate } from 'calypso/state/ui/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';

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
			onSuccess: ( action, { list } ) => {
				if ( list?.owner && list?.slug ) {
					return [
						receiveReaderList( { list } ),
						navigate( `/read/list/${ list.owner }/${ list.slug }/edit` ),
						successNotice( translate( 'List created successfully!' ) ),
					];
				}
				// NOTE: Add better handling for unexpected response format here.
				errorNotice( translate( 'List could not be created, please try again later.' ) );
			},
			onError: ( action, error ) => [
				errorNotice( String( error ) ),
				handleReaderListRequestFailure( error ),
			],
		} ),
	],
	[ READER_LIST_FOLLOW ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/follow`,
						apiVersion: '1.2',
						body: {},
					},
					action
				),
			onSuccess: ( action, { list } ) => {
				return receiveFollowList( list );
			},
			onError: ( action, error ) => [ errorNotice( String( error ) ) ],
		} ),
	],
	[ READER_LIST_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }`,
						apiVersion: '1.2',
					},
					action
				),
			onSuccess: ( action, { list } ) => receiveReaderList( { list } ),
			onError: ( action, error ) => [
				errorNotice( String( error ), { duration: DEFAULT_NOTICE_DURATION } ),
				handleReaderListRequestFailure( error ),
			],
		} ),
	],
	[ READER_LIST_UNFOLLOW ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'POST',
						path: `/read/lists/${ action.listOwner }/${ action.listSlug }/unfollow`,
						apiVersion: '1.2',
						body: {},
					},
					action
				),
			onSuccess: ( action, { list } ) => {
				return receiveUnfollowList( list );
			},
			onError: ( action, error ) => [ errorNotice( String( error ) ) ],
		} ),
	],
	[ READER_LIST_UPDATE ]: [
		dispatchRequest( {
			fetch: ( action ) => {
				return http(
					{
						method: 'POST',
						path: `/read/lists/${ action.list.owner }/${ action.list.slug }/update`,
						apiVersion: '1.2',
						body: action.list,
					},
					action
				);
			},
			onSuccess: ( action, response ) => [
				receiveUpdatedListDetails( response ),
				successNotice( translate( 'List updated successfully!' ) ),
			],
			onError: ( action, error ) => [
				errorNotice( String( error ) ),
				handleUpdateListDetailsError( error, action.list ),
			],
		} ),
	],
	[ READER_LISTS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/read/lists`,
						apiVersion: '1.2',
					},
					action
				),
			onSuccess: ( action, apiResponse ) => receiveLists( apiResponse?.lists ),
			onError: ( action, error ) => errorNotice( error ),
		} ),
	],
} );
