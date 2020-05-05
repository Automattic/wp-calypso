/**
 * Internal dependencies
 */
import {
	JETPACK_CREDENTIALS_AUTOCONFIGURE,
	JETPACK_CREDENTIALS_DELETE,
	JETPACK_CREDENTIALS_UPDATE,
} from 'state/action-types';

import 'state/data-layer/wpcom/activity-log/delete-credentials';
import 'state/data-layer/wpcom/activity-log/rewind/activate';
import 'state/data-layer/wpcom/activity-log/update-credentials';

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
