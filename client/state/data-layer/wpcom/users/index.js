/**
 * External dependencies
 */
import { flow, isUndefined, map, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { USERS_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receiveUser,
} from 'state/users/actions';

/**
 * Normalize a WP REST API (v2) user ressource for consumption in Calypso
 *
 * @param {Object} user Raw user from the API
 * @returns {Object} the normalized user
 */
export const normalizeUser = ( user ) => omitBy( {
	ID: user.id,
	display_name: user.name,
	username: user.slug,
}, isUndefined );

/**
 * Dispatches returned users
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Function} next dispatches to next middleware in chain
 * @param {Array} users raw data from post revisions API
 */
export const receiveSuccess = ( { dispatch }, action, next, users ) => {
	map( users, flow( normalizeUser, receiveUser, dispatch ) );
};

/**
 * Dispatches a request to fetch post revisions users
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 */
export const fetchUsers = ( { dispatch }, action ) => {
	const { siteId, ids } = action;
	dispatch( http( {
		path: `/sites/${ siteId }/users`,
		method: 'GET',
		query: {
			apiNamespace: 'wp/v2',
			include: ids,
		},
	}, action ) );
};

const dispatchUsersRequest = dispatchRequest(
	fetchUsers,
	receiveSuccess,
	() => {} // FIXME: for now, let's ignore that we couldn't get extra information about the authors
);

export default {
	[ USERS_REQUEST ]: [ dispatchUsersRequest ],
};
