/**
 * External dependencies
 */

import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import {
	SITE_REDIRECT_FETCH,
	SITE_REDIRECT_FETCH_COMPLETED,
	SITE_REDIRECT_FETCH_FAILED,
	SITE_REDIRECT_NOTICE_CLOSE,
	SITE_REDIRECT_UPDATE,
	SITE_REDIRECT_UPDATE_COMPLETED,
	SITE_REDIRECT_UPDATE_FAILED,
} from './action-types';

function updateStateForSite( state, siteId, data ) {
	const command = state[ siteId ] ? '$merge' : '$set';

	return update( state, {
		[ siteId ]: {
			[ command ]: data,
		},
	} );
}

function getInitialStateForSite() {
	return {
		isFetching: false,
		isUpdating: false,
		notice: null,
		value: null,
	};
}

function reducer( state, payload ) {
	const { action } = payload;

	switch ( action.type ) {
		case SITE_REDIRECT_NOTICE_CLOSE:
			state = updateStateForSite( state, action.siteId, {
				notice: null,
			} );

			break;

		case SITE_REDIRECT_FETCH:
			state = updateStateForSite( state, action.siteId, {
				isFetching: true,
			} );

			break;

		case SITE_REDIRECT_FETCH_COMPLETED:
			state = updateStateForSite( state, action.siteId, {
				isFetching: false,
				notice: null,
				value: action.location,
			} );

			break;

		case SITE_REDIRECT_FETCH_FAILED:
			state = updateStateForSite( state, action.siteId, {
				isFetching: false,
				notice: {
					error: true,
					text: action.error,
				},
			} );

			break;

		case SITE_REDIRECT_UPDATE:
			state = updateStateForSite( state, action.siteId, {
				isUpdating: true,
			} );

			break;

		case SITE_REDIRECT_UPDATE_COMPLETED:
			state = updateStateForSite( state, action.siteId, {
				isUpdating: false,
				notice: {
					success: true,
					text: action.success,
				},
				value: action.location,
			} );

			break;

		case SITE_REDIRECT_UPDATE_FAILED:
			state = updateStateForSite( state, action.siteId, {
				isUpdating: false,
				notice: {
					error: true,
					text: action.error,
				},
			} );

			break;
	}

	return state;
}

export { getInitialStateForSite, reducer };
