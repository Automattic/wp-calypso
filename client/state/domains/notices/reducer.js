import update from 'immutability-helper';
import {
	DOMAINS_NOTICES_REQUEST,
	DOMAINS_NOTICES_REQUEST_SUCCESS,
	DOMAINS_NOTICES_REQUEST_FAILURE,
	DOMAINS_NOTICE_UPDATE,
	DOMAINS_NOTICE_UPDATE_SUCCESS,
	DOMAINS_NOTICE_UPDATE_FAILURE,
} from 'calypso/state/action-types';

function updateStateForDomain( state, domainName, newData ) {
	const command = state[ domainName ] ? '$merge' : '$set';

	const data = Object.assign( {}, newData );
	data.items = Object.assign( {}, state[ domainName ]?.items || {}, newData.items || {} );

	const newState = update( state, {
		[ domainName ]: {
			[ command ]: data,
		},
	} );

	return newState;
}

export const initialStateForSite = {
	isFetching: false,
	isUpdating: false,
	items: {},
	error: null,
};

export default function reducer( state = {}, action ) {
	switch ( action.type ) {
		case DOMAINS_NOTICES_REQUEST:
			state = updateStateForDomain( state, action.domainName, {
				isFetching: true,
			} );
			break;

		case DOMAINS_NOTICES_REQUEST_SUCCESS:
			state = updateStateForDomain( state, action.domainName, {
				isFetching: false,
				items: action.notices,
				error: null,
			} );
			break;

		case DOMAINS_NOTICES_REQUEST_FAILURE:
			state = updateStateForDomain( state, action.domainName, {
				isFetching: false,
				error: action.error,
			} );
			break;

		case DOMAINS_NOTICE_UPDATE:
			state = updateStateForDomain( state, action.domainName, {
				isUpdating: true,
			} );
			break;

		case DOMAINS_NOTICE_UPDATE_SUCCESS:
			state = updateStateForDomain( state, action.domainName, {
				isUpdating: false,
				error: null,
				items: action.notices,
			} );
			break;

		case DOMAINS_NOTICE_UPDATE_FAILURE:
			state = updateStateForDomain( state, action.domainName, {
				isUpdating: false,
				error: action.error,
			} );
			break;
	}

	return state;
}
