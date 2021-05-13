/**
 * External dependencies
 */
import update from 'immutability-helper';

/**
 * Internal dependencies
 */
import {
	DOMAINS_SITE_REDIRECT_FETCH,
	DOMAINS_SITE_REDIRECT_FETCH_COMPLETED,
	DOMAINS_SITE_REDIRECT_FETCH_FAILED,
	DOMAINS_SITE_REDIRECT_NOTICE_CLOSE,
	DOMAINS_SITE_REDIRECT_UPDATE,
	DOMAINS_SITE_REDIRECT_UPDATE_COMPLETED,
	DOMAINS_SITE_REDIRECT_UPDATE_FAILED,
} from 'calypso/state/action-types';

function updateStateForSite( state, siteId, data ) {
	const command = state[ siteId ] ? '$merge' : '$set';

	return update( state, {
		[ siteId ]: {
			[ command ]: data,
		},
	} );
}

export const initialStateForSite = {
	isFetching: false,
	isUpdating: false,
	notice: null,
	value: '',
};

export default function reducer( state = {}, action ) {
	switch ( action.type ) {
		case DOMAINS_SITE_REDIRECT_NOTICE_CLOSE:
			state = updateStateForSite( state, action.siteId, {
				notice: null,
			} );
			break;

		case DOMAINS_SITE_REDIRECT_FETCH:
			state = updateStateForSite( state, action.siteId, {
				isFetching: true,
			} );
			break;

		case DOMAINS_SITE_REDIRECT_FETCH_COMPLETED:
			state = updateStateForSite( state, action.siteId, {
				isFetching: false,
				notice: null,
				value: action.location,
			} );
			break;

		case DOMAINS_SITE_REDIRECT_FETCH_FAILED:
			state = updateStateForSite( state, action.siteId, {
				isFetching: false,
				notice: {
					error: true,
					text: action.error,
				},
			} );
			break;

		case DOMAINS_SITE_REDIRECT_UPDATE:
			state = updateStateForSite( state, action.siteId, {
				isUpdating: true,
			} );
			break;

		case DOMAINS_SITE_REDIRECT_UPDATE_COMPLETED:
			state = updateStateForSite( state, action.siteId, {
				isUpdating: false,
				notice: {
					success: true,
					text: action.success,
				},
				value: action.location,
			} );
			break;

		case DOMAINS_SITE_REDIRECT_UPDATE_FAILED:
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
