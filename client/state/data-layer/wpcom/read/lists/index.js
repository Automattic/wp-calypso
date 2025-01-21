import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import {
	READER_LIST__CREATE,
	READER_LIST__FOLLOW,
	READER_LIST__REQUEST_TARGET_LIST,
	READER_LIST__UNFOLLOW,
	READER_LIST__UPDATE,
	READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS,
	READER_USER__REQUEST_LISTS,
	READER_USER__RECEIVE_LISTS,
} from 'calypso/state/reader/action-types';
import {
	handleCreateReaderListFailure,
	handleUpdateListDetailsError,
	receiveFollowList,
	receiveCurrentUserSubscribedLists,
	receiveUnfollowList,
	receiveCreateReaderList,
	receiveUpdatedListDetails,
} from 'calypso/state/reader/lists/actions';

const noop = () => {};

registerHandlers( 'state/data-layer/wpcom/read/lists/index.js', {
	[ READER_LIST__CREATE ]: [
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
	[ READER_LIST__FOLLOW ]: [
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
	[ READER_LIST__REQUEST_TARGET_LIST ]: [
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
			onSuccess: ( action, { list } ) => receiveCreateReaderList( { list } ),
			onError: ( action, error ) => [ handleCreateReaderListFailure( error ) ],
		} ),
	],
	[ READER_LIST__UNFOLLOW ]: [
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
	[ READER_LIST__UPDATE ]: [
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
	[ READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS ]: [
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
			onSuccess: ( action, apiResponse ) => receiveCurrentUserSubscribedLists( apiResponse?.lists ),
			onError: () => noop,
		} ),
	],
	// Request only public lists for a specific user
	[ READER_USER__REQUEST_LISTS ]: [
		dispatchRequest( {
			fetch: ( action ) =>
				http(
					{
						method: 'GET',
						path: `/read/lists/${ action.userSlug }`,
						apiVersion: '1',
					},
					action
				),
			onSuccess: ( action, apiResponse ) => ( {
				type: READER_USER__RECEIVE_LISTS,
				userSlug: action.userSlug,
				lists: apiResponse?.lists,
			} ),
			onError: () => noop,
		} ),
	],
} );
