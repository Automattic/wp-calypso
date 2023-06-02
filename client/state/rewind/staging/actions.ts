import {
	JETPACK_BACKUP_STAGING_GET_REQUEST,
	JETPACK_BACKUP_STAGING_LIST_REQUEST,
	JETPACK_BACKUP_STAGING_UPDATE_REQUEST,
} from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/rewind/staging';
import 'calypso/state/data-layer/wpcom/sites/rewind/staging/list';
import 'calypso/state/data-layer/wpcom/sites/rewind/staging/update';
import {
	GetStagingSiteRequestActionType,
	ListStagingSitesRequestActionType,
	UpdateStagingFlagRequestActionType,
} from './types';

const trackRequests = {
	meta: {
		dataLayer: {
			trackRequest: true,
		},
	},
};

export const requestBackupStagingSitesList = (
	siteId: number | null
): ListStagingSitesRequestActionType => ( {
	type: JETPACK_BACKUP_STAGING_LIST_REQUEST,
	siteId,
	...trackRequests,
} );

export const requestUpdateBackupStagingFlag = (
	siteId: number,
	staging: boolean
): UpdateStagingFlagRequestActionType => ( {
	type: JETPACK_BACKUP_STAGING_UPDATE_REQUEST,
	siteId,
	staging,
	...trackRequests,
} );

export const requestBackupStagingSiteInfo = (
	siteId: number | null
): GetStagingSiteRequestActionType => ( {
	type: JETPACK_BACKUP_STAGING_GET_REQUEST,
	siteId,
	...trackRequests,
} );
