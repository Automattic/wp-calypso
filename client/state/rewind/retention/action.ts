import { Action } from 'redux';
import { REWIND_BACKUP_RETENTION_UPDATE } from 'calypso/state/action-types';
import type { RetentionPeriod } from './types';
import 'calypso/state/data-layer/wpcom/sites/rewind/retention';

type RequestActionType = Action< typeof REWIND_BACKUP_RETENTION_UPDATE > & {
	siteId: number | null;
	rententionDays: RetentionPeriod;
};

export const updateBackupRetention = (
	siteId: number | null,
	rententionDays: RetentionPeriod
): RequestActionType => ( {
	type: REWIND_BACKUP_RETENTION_UPDATE,
	siteId,
	rententionDays,
} );
