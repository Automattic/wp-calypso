import { Action } from 'redux';
import { JETPACK_BACKUP_RETENTION_UPDATE } from 'calypso/state/action-types';
import type { RetentionPeriod } from './types';
import 'calypso/state/data-layer/wpcom/sites/rewind/retention';

type RequestActionType = Action< typeof JETPACK_BACKUP_RETENTION_UPDATE > & {
	siteId: number | null;
	retentionDays: RetentionPeriod;
};

export const updateBackupRetention = (
	siteId: number | null,
	retentionDays: RetentionPeriod
): RequestActionType => ( {
	type: JETPACK_BACKUP_RETENTION_UPDATE,
	siteId,
	retentionDays,
} );
