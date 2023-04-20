import { JETPACK_BACKUP_STAGING_LIST_REQUEST } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/rewind/staging/list';
import type { Action } from 'redux';

const trackRequests = {
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
};

type RequestActionType = Action< typeof JETPACK_BACKUP_STAGING_LIST_REQUEST > &
	typeof trackRequests & {
		siteId: number | null;
	};

export const requestBackupStagingSitesList = ( siteId: number | null ): RequestActionType => ( {
	type: JETPACK_BACKUP_STAGING_LIST_REQUEST,
	siteId,
	...trackRequests,
} );
