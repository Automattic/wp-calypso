/**
 * Internal dependencies
 */
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { FOLLOWERS_REQUEST, FOLLOWER_REMOVE_REQUEST } from 'calypso/state/action-types';
import {
	requestFollowersSuccess,
	requestFollowersFailure,
	successRemoveFollower,
	failRemoveFollower,
} from 'calypso/state/followers/actions';

const fetchFollowers = ( action ) => {
	const { query } = action;

	return [
		http(
			{
				method: 'GET',
				path: `/sites/${ query.siteId }/followers`,
				apiVersion: '1.1',
				query,
			},
			action
		),
	];
};

const receiveFollowers = ( { query }, data ) => [ requestFollowersSuccess( query, data ) ];

const requestFollowersError = ( { query }, error ) => [ requestFollowersFailure( query, error ) ];

const removeFollower = ( action ) => {
	const { siteId, follower } = action;

	return [
		http(
			{
				method: 'POST',
				path: `/sites/${ siteId }/followers/${ follower.ID }/delete`,
				apiVersion: '1.1',
			},
			action
		),
	];
};

const removeFollowerSuccess = ( { siteId, follower }, data ) => [
	successRemoveFollower( siteId, follower, data ),
];

const removeFollowerError = ( { siteId, follower }, error ) => [
	failRemoveFollower( siteId, follower, error ),
];

registerHandlers( 'state/data-layer/wpcom/followers/index.js', {
	[ FOLLOWERS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchFollowers,
			onSuccess: receiveFollowers,
			onError: requestFollowersError,
		} ),
	],
	[ FOLLOWER_REMOVE_REQUEST ]: [
		dispatchRequest( {
			fetch: removeFollower,
			onSuccess: removeFollowerSuccess,
			onError: removeFollowerError,
		} ),
	],
} );
