import update from 'immutability-helper';
import {
	DOMAIN_NOTICES_STATUS_REQUEST,
	DOMAIN_NOTICES_STATUS_REQUEST_COMPLETED,
	DOMAIN_NOTICES_STATUS_DISMISS,
} from 'calypso/state/action-types';
import initialNoticeState from './initial';

function updateNotices( state, domainName, noticeData ) {
	const domainNotices = state[ domainName ] || initialNoticeState;

	const command = {
		[ domainName ]: {
			$set: Object.assign( {}, domainNotices, { ...noticeData } ),
		},
	};

	return update( state, command );
}

function addDismissedNotice( state, domainName, noticeType ) {
	const domainNotices = state[ domainName ] || initialNoticeState;
	const noticeStates = domainNotices?.notices || {};

	return {
		[ domainName ]: Object.assign( {}, domainNotices, {
			notices: Object.assign( {}, noticeStates, { [ noticeType ]: 'dismissed' } ),
		} ),
	};
}

export default function reducer( state = {}, action ) {
	if ( ! action.domainName ) {
		return state;
	}

	switch ( action.type ) {
		case DOMAIN_NOTICES_STATUS_REQUEST:
			state = updateNotices( state, action.domainName, { isFetching: true } );
			break;

		case DOMAIN_NOTICES_STATUS_REQUEST_COMPLETED:
			state = updateNotices( state, action.domainName, {
				isFetching: false,
				hasLoadedFromServer: true,
				notices: action.notices,
			} );
			break;

		case DOMAIN_NOTICES_STATUS_DISMISS:
			state = updateNotices( state, action.domainName, { isFetching: true } );
			state = addDismissedNotice( state, action.domainName, action.noticeType );
			break;
	}

	return state;
}
