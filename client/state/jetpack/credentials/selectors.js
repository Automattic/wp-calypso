/**
 * External Dependencies
 */
import { get } from 'lodash';

export const getJetpackCredentials = ( state, siteId, role ) => {
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, role ], {} );
};

export const getAllRoles = ( state, siteId ) => {
	return get( state, [ 'jetpack', 'credentials', 'items', siteId ], {} );
};

export const credentialsUpdating = ( state, siteId ) => {
	return get( state, [ 'jetpack', 'credentials', 'updateRequesting', siteId ], false );
};

export const hasMainCredentials = ( state, siteId ) => {
	return !! get( state, [ 'jetpack', 'credentials', 'items', siteId, 'main' ], false );
};

export const isSitePressable = ( state, siteId ) => {
	return get( state.activityLog.rewindStatus, [ siteId, 'isPressable' ], null );
};

export const getAutoConfigStatus = ( state, siteId ) => {
	return get( state, [ 'jetpack', 'credentials', 'items', siteId, 'main' ], false ) ? 'requesting' : 'success';
};
