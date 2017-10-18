/**
 * External Dependencies
 */
import { get } from 'lodash';

export const getJetpackCredentials = ( state, role ) => {
	return get( state, [ 'jetpack', 'credentials', 'items', role ], {} );
};

export const getAllRoles = ( state ) => {
	return get( state, [ 'jetpack', 'credentials', 'items' ], {} );
};

export const credentialsUpdating = state => {
	return get( state, [ 'jetpack', 'credentials', 'updateRequesting' ], false );
};

export const credentialsUpdateFailed = state => {
	return get( state, [ 'jetpack', 'credentials', 'updateFailed' ], false );
};

export const credentialsUpdateSuccess = state => {
	return get( state, [ 'jetpack', 'credentials', 'updateSuccess' ], false );
};

export const hasMainCredentials = ( state ) => {
	return !! get( state, [ 'jetpack', 'credentials', 'items', 'main' ], false );
};

export const getAutoConfigStatus = ( state ) => {
	if ( get( state, [ 'jetpack', 'credentials', 'autoConfigRequesting' ], false ) ) {
		return 'requesting';
	}

	if ( get( state, [ 'jetpack', 'credentials', 'autoConfigSuccess' ], false ) ) {
		return 'success';
	}

	if ( get( state, [ 'jetpack', 'credentials', 'autoConfigFailed' ], false ) ) {
		return 'failed';
	}

	return 'waiting';
};

export const isRequestingCredentials = state => {
	return get( state, [ 'jetpack', 'credentials', 'requesting' ], false );
};

export const isSitePressable = ( state, siteId ) => {
	return get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null );
};

