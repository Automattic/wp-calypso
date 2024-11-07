import { withStorageKey } from '@automattic/state-utils';
import {
	HOSTING_GEO_AFFINITY_REQUEST,
	HOSTING_GEO_AFFINITY_SET,
	HOSTING_PHP_VERSION_SET,
	HOSTING_WP_VERSION_REQUEST,
	HOSTING_WP_VERSION_SET,
	HOSTING_SFTP_USER_UPDATE,
	HOSTING_SFTP_USERS_SET,
	HOSTING_SSH_ACCESS_SET,
	HOSTING_STATIC_FILE_404_SET,
	HOSTING_CLEAR_CACHE_REQUEST,
	HOSTING_SFTP_USERS_REQUEST,
	HOSTING_SSH_ACCESS_REQUEST,
	HOSTING_CLEAR_EDGE_CACHE_SUCCESS,
} from 'calypso/state/action-types';
import {
	combineReducers,
	keyedReducer,
	withPersistence,
	withSchemaValidation,
} from 'calypso/state/utils';

export const sftpUsers = ( state = {}, { type, users } ) => {
	if ( type === HOSTING_SFTP_USERS_SET ) {
		return users;
	}

	if ( type === HOSTING_SFTP_USER_UPDATE && Array.isArray( state ) ) {
		return state.map( ( user ) => {
			const updatedUser = users.find( ( u ) => u.username === user.username );
			return {
				...user,
				...updatedUser,
			};
		} );
	}

	return state;
};

export const isLoadingSftpUsers = ( state = null, { type } ) => {
	switch ( type ) {
		case HOSTING_SFTP_USERS_REQUEST:
			return true;
		case HOSTING_SFTP_USERS_SET:
			return false;
	}

	return state;
};

const geoAffinity = ( state = null, { type, setting } ) => {
	switch ( type ) {
		case HOSTING_GEO_AFFINITY_SET:
			return setting;
	}

	return state;
};

const isFetchingGeoAffinity = ( state = null, { type } ) => {
	switch ( type ) {
		case HOSTING_GEO_AFFINITY_REQUEST:
			return true;
		case HOSTING_GEO_AFFINITY_SET:
			return false;
	}

	return state;
};

const phpVersion = ( state = null, { type, version } ) => {
	switch ( type ) {
		case HOSTING_PHP_VERSION_SET:
			return version;
	}

	return state;
};

const isFetchingWpVersion = ( state = false, { type } ) => {
	switch ( type ) {
		case HOSTING_WP_VERSION_REQUEST:
			return true;
		case HOSTING_WP_VERSION_SET:
			return false;
	}

	return state;
};

const wpVersion = ( state = null, { type, version } ) => {
	switch ( type ) {
		case HOSTING_WP_VERSION_SET:
			return version;
	}

	return state;
};

const sshAccess = ( state = null, { type, status } ) => {
	switch ( type ) {
		case HOSTING_SSH_ACCESS_SET:
			return status;
	}

	return state;
};

const isLoadingSshAccess = ( state = null, { type } ) => {
	switch ( type ) {
		case HOSTING_SSH_ACCESS_REQUEST:
			return true;
		case HOSTING_SSH_ACCESS_SET:
			return false;
	}

	return state;
};

const staticFile404 = ( state = null, { type, setting } ) => {
	switch ( type ) {
		case HOSTING_STATIC_FILE_404_SET:
			return setting;
	}

	return state;
};

export const lastCacheClearTimestamp = withSchemaValidation(
	{ type: 'integer' },
	withPersistence( ( state = null, { type } ) => {
		switch ( type ) {
			case HOSTING_CLEAR_CACHE_REQUEST:
				return new Date().valueOf();
		}

		return state;
	} )
);

export const lastEdgeCacheClearTimestamp = withSchemaValidation(
	{ type: 'integer' },
	withPersistence( ( state = null, { type } ) => {
		switch ( type ) {
			case HOSTING_CLEAR_EDGE_CACHE_SUCCESS:
				return new Date().valueOf();
		}

		return state;
	} )
);

const atomicHostingReducer = combineReducers( {
	geoAffinity,
	isFetchingGeoAffinity,
	phpVersion,
	sftpUsers,
	isLoadingSftpUsers,
	sshAccess,
	isLoadingSshAccess,
	staticFile404,
	isFetchingWpVersion,
	wpVersion,
	lastCacheClearTimestamp,
	lastEdgeCacheClearTimestamp,
} );

const reducer = keyedReducer( 'siteId', atomicHostingReducer );
export default withStorageKey( 'atomicHosting', reducer );
