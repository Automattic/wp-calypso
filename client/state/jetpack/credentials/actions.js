import {
	JETPACK_CREDENTIALS_GET,
	JETPACK_CREDENTIALS_AUTOCONFIGURE,
	JETPACK_CREDENTIALS_DELETE,
	JETPACK_CREDENTIALS_UPDATE,
	JETPACK_CREDENTIALS_TEST,
	JETPACK_CREDENTIALS_TEST_VALID,
	JETPACK_CREDENTIALS_TEST_INVALID,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/activity-log/get-credentials';
import { success as removeCredentialsFromState } from 'calypso/state/data-layer/wpcom/activity-log/delete-credentials';
import 'calypso/state/data-layer/wpcom/activity-log/update-credentials';
import 'calypso/state/data-layer/wpcom/activity-log/rewind/activate';
import 'calypso/state/data-layer/wpcom/sites/rewind/credentials';
import 'calypso/state/jetpack/init';

export const getCredentials = ( siteId ) => ( {
	type: JETPACK_CREDENTIALS_GET,
	siteId,
} );

export const updateCredentials = (
	siteId,
	credentials,
	stream = false,
	shouldUseNotices = true
) => ( {
	type: JETPACK_CREDENTIALS_UPDATE,
	siteId,
	credentials,
	stream,
	shouldUseNotices,
} );

export const autoConfigCredentials = ( siteId ) => ( {
	type: JETPACK_CREDENTIALS_AUTOCONFIGURE,
	siteId,
} );

export const deleteCredentials = ( siteId, role ) => ( dispatch ) => {
	// Optimistically store an empty credentials object,
	// assuming the API delete request will succeed.
	//
	// NOTE: This is a little sub-optimal and ignores the rewind_state parameter,
	// but we're also not currently handling the error case anyway; see:
	// client/state/data-layer/wpcom/activity-log/delete-credentials/index.js
	dispatch( removeCredentialsFromState( { siteId }, {} ) );

	dispatch( {
		type: JETPACK_CREDENTIALS_DELETE,
		siteId,
		role,
	} );
};

export const testCredentials = ( siteId, role ) => ( {
	type: JETPACK_CREDENTIALS_TEST,
	siteId,
	role,
} );

export const markCredentialsAsValid = ( siteId, role ) => ( {
	type: JETPACK_CREDENTIALS_TEST_VALID,
	siteId,
	role,
} );

export const markCredentialsAsInvalid = ( siteId, role ) => ( {
	type: JETPACK_CREDENTIALS_TEST_INVALID,
	siteId,
	role,
} );
