import 'calypso/state/admin-color/init';
import 'calypso/state/data-layer/wpcom/sites/admin-color';
import {
	ADMIN_COLOR_RECEIVE,
	ADMIN_COLOR_REQUEST,
	ADMIN_COLOR_SAVE_FAILURE,
	ADMIN_COLOR_SAVE_SUCCESS,
	ADMIN_COLOR_SAVE,
} from 'calypso/state/action-types';

export function requestAdminColor( siteId, adminColor ) {
	return {
		type: ADMIN_COLOR_REQUEST,
		siteId,
		adminColor,
	};
}

export function receiveAdminColor( siteId, adminColor ) {
	return {
		type: ADMIN_COLOR_RECEIVE,
		siteId,
		adminColor,
	};
}

export const saveAdminColor = ( siteId, adminColor ) => ( {
	type: ADMIN_COLOR_SAVE,
	siteId,
	adminColor,
} );

export function saveAdminColorSuccess( siteId, adminColor ) {
	return {
		type: ADMIN_COLOR_SAVE_SUCCESS,
		siteId,
		adminColor,
	};
}

export const saveAdminColorFailure = ( siteId, error ) => ( {
	type: ADMIN_COLOR_SAVE_FAILURE,
	siteId,
	error,
} );
