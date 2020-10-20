/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_GET,
	JETPACK_CREDENTIALS_AUTOCONFIGURE,
	JETPACK_CREDENTIALS_DELETE,
	JETPACK_CREDENTIALS_UPDATE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/activity-log/get-credentials';
import 'calypso/state/data-layer/wpcom/activity-log/delete-credentials';
import 'calypso/state/data-layer/wpcom/activity-log/update-credentials';
import 'calypso/state/data-layer/wpcom/activity-log/rewind/activate';
import 'calypso/state/jetpack/init';

export const getCredentials = ( siteId ) => ( {
	type: JETPACK_CREDENTIALS_GET,
	siteId,
} );

export const updateCredentials = ( siteId, credentials ) => ( {
	type: JETPACK_CREDENTIALS_UPDATE,
	siteId,
	credentials,
} );

export const autoConfigCredentials = ( siteId ) => ( {
	type: JETPACK_CREDENTIALS_AUTOCONFIGURE,
	siteId,
} );

export const deleteCredentials = ( siteId, role ) => ( {
	type: JETPACK_CREDENTIALS_DELETE,
	siteId,
	role,
} );
