import 'calypso/state/user-profile/init';
import 'calypso/state/data-layer/wpcom/sites/user-profile';
import { USER_PROFILE_RECEIVE, USER_PROFILE_REQUEST } from 'calypso/state/action-types';

export function requestUserProfile( siteId, profile ) {
	return {
		type: USER_PROFILE_REQUEST,
		siteId,
		profile,
	};
}

export function receiveUserProfile( siteId, profile ) {
	return {
		type: USER_PROFILE_RECEIVE,
		siteId,
		profile,
	};
}
