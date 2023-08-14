import update from 'immutability-helper';
import {
	DOMAINS_REDIRECT_FETCH,
	DOMAINS_REDIRECT_FETCH_COMPLETED,
	DOMAINS_REDIRECT_FETCH_FAILED,
	DOMAINS_REDIRECT_NOTICE_CLOSE,
	DOMAINS_REDIRECT_UPDATE,
	DOMAINS_REDIRECT_UPDATE_COMPLETED,
	DOMAINS_REDIRECT_UPDATE_FAILED,
	DOMAINS_REDIRECT_DELETE,
	DOMAINS_REDIRECT_DELETE_COMPLETED,
	DOMAINS_REDIRECT_DELETE_FAILED,
} from 'calypso/state/action-types';

function updateStateForDomain( state, domain, data ) {
	const command = state[ domain ] ? '$merge' : '$set';
	return update( state, {
		[ domain ]: {
			[ command ]: data,
		},
	} );
}

export const initialStateForDomain = {
	isFetching: false,
	isFetched: false,
	isUpdating: false,
	notice: null,
	targetHost: null,
	targetPath: null,
	forwardPaths: false,
	isSecure: true,
	domainRedirectId: null,
};

export default function reducer( state = {}, action ) {
	switch ( action.type ) {
		case DOMAINS_REDIRECT_NOTICE_CLOSE:
			state = updateStateForDomain( state, action.domain, {
				notice: null,
			} );
			break;

		case DOMAINS_REDIRECT_FETCH:
			state = updateStateForDomain( state, action.domain, {
				isFetching: true,
			} );
			break;

		case DOMAINS_REDIRECT_FETCH_COMPLETED:
			state = updateStateForDomain( state, action.domain, {
				isFetching: false,
				isFetched: true,
				notice: null,
				targetHost: action.targetHost,
				targetPath: action.targetPath,
				forwardPaths: action.forwardPaths,
				isSecure: action.isSecure,
				domainRedirectId: action.domainRedirectId,
			} );
			break;

		case DOMAINS_REDIRECT_FETCH_FAILED:
			state = updateStateForDomain( state, action.domain, {
				isFetching: false,
				notice: {
					error: true,
					text: action.error,
				},
			} );
			break;

		case DOMAINS_REDIRECT_UPDATE:
			state = updateStateForDomain( state, action.domain, {
				isUpdating: true,
			} );
			break;

		case DOMAINS_REDIRECT_UPDATE_COMPLETED:
			state = updateStateForDomain( state, action.domain, {
				isUpdating: false,
				notice: {
					success: true,
					text: action.success,
				},
				targetHost: action.targetHost,
				targetPath: action.targetPath,
				forwardPaths: action.forwardPaths,
				isSecure: action.isSecure,
			} );
			break;

		case DOMAINS_REDIRECT_UPDATE_FAILED:
			state = updateStateForDomain( state, action.domain, {
				isUpdating: false,
				notice: {
					error: true,
					text: action.error,
				},
			} );
			break;
		case DOMAINS_REDIRECT_DELETE:
			state = updateStateForDomain( state, action.domain, {
				isUpdating: true,
			} );
			break;

		case DOMAINS_REDIRECT_DELETE_COMPLETED:
			state = updateStateForDomain( state, action.domain, {
				isUpdating: false,
				notice: {
					success: true,
					text: action.success,
				},
				targetHost: null,
				targetPath: null,
				forwardPaths: false,
				isSecure: true,
				domainRedirectId: null,
			} );
			break;

		case DOMAINS_REDIRECT_DELETE_FAILED:
			state = updateStateForDomain( state, action.domain, {
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
