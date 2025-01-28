import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import {
	READER_LIST_CREATE,
	READER_LIST_FOLLOW,
	READER_LIST_REQUEST,
	READER_LIST_UNFOLLOW,
	READER_LIST_UPDATE,
	READER_LISTS_REQUEST,
	READER_USER_LISTS_REQUEST,
	READER_USER_LISTS_RECEIVE,
} from 'calypso/state/reader/action-types';
import {
	handleCreateReaderListFailure,
	handleRequestListFailure,
	handleUpdateListDetailsError,
	receiveFollowList,
	receiveLists,
	receiveReaderList,
	receiveUnfollowList,
	receiveCreateReaderList,
	receiveUpdatedListDetails,
} from 'calypso/state/reader/lists/actions';

const noop = () => {};

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
						receiveCreateReaderList( { list } ),
						() => page( `/read/list/${ list.owner }/${ list.slug }/edit` ),
						successNotice( translate( 'List created successfully.' ), {
							duration: DEFAULT_NOTICE_DURATION,
						} ),
					];
				}
				errorNotice( translate( 'Unable to create new list.' ) );
			},
			onError: ( action, error ) => [
				errorNotice( translate( 'Unable to create new list.' ) ),
				handleCreateReaderListFailure( error ),
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
			onError: () => [ errorNotice( translate( 'Unable to follow list.' ) ) ],
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
			onError: ( action, error ) => [ handleRequestListFailure( error ) ],
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
			onError: () => [ errorNotice( translate( 'Unable to unfollow list.' ) ) ],
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
				successNotice( translate( 'List updated successfully.' ), {
					duration: DEFAULT_NOTICE_DURATION,
				} ),
			],
			onError: ( action, error ) => [
				errorNotice( translate( 'Unable to update list.' ) ),
				handleUpdateListDetailsError( error, action.list ),
			],
		} ),
	],
	// Request public and private lists for the current user
	[ READER_LISTS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: '/read/lists',
						apiVersion: '1.2',
					},
					action
				),
			onSuccess: ( action, apiResponse ) => receiveLists( apiResponse?.lists ),
			onError: () => noop,
		} ),
	],
	// Request only public lists for a specific user
	[ READER_USER_LISTS_REQUEST ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/read/lists/${ action.userLogin }`,
						apiVersion: '1',
					},
					action
				),
			onSuccess: ( action, apiResponse ) => ( {
				type: READER_USER_LISTS_RECEIVE,
				userLogin: action.userLogin,
				lists: apiResponse?.lists,
			} ),
			onError: () => noop,
		} ),
	],
} );
