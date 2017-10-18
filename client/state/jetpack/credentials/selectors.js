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

export const hasMainCredentials = ( state ) => {
	return !! get( state, [ 'jetpack', 'credentials', 'items', 'main' ], false );
};

export const isSitePressable = ( state, siteId ) => {
	return get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null );
};

