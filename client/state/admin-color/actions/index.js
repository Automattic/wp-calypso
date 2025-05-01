import 'calypso/state/admin-color/init';
import 'calypso/state/data-layer/wpcom/sites/admin-color';
import {
	ADMIN_COLOR_RECEIVE,
	ADMIN_COLOR_REQUEST,
	ADMIN_COLOR_REQUEST_FAILURE,
} from 'calypso/state/action-types';

export function requestAdminColor( siteId, adminColor ) {
	return {
		type: ADMIN_COLOR_REQUEST,
		siteId,
		adminColor,
	};
}

export function requestAdminColorFailure( siteId ) {
	return {
		type: ADMIN_COLOR_REQUEST_FAILURE,
		siteId,
	};
}

export function receiveAdminColor( siteId, adminColor ) {
	return {
		type: ADMIN_COLOR_RECEIVE,
		siteId,
		adminColor,
	};
}
