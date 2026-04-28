import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	READER_LIST_FOLLOW,
	READER_LIST_UNFOLLOW,
	READER_USER_LISTS_REQUEST,
	READER_USER_LISTS_RECEIVE,
} from 'calypso/state/reader/action-types';
import { receiveFollowList, receiveUnfollowList } from 'calypso/state/reader/lists/actions';

const noop = () => {};

registerHandlers( 'state/data-layer/wpcom/read/lists/index.js', {
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
