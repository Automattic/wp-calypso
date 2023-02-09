import { JETPACK_BACKUP_RETENTION_UPDATE } from 'calypso/state/action-types';
import type { UpdateRequestActionType, RetentionPeriod } from './types';
import 'calypso/state/data-layer/wpcom/sites/rewind/retention';
import 'calypso/state/rewind/init';

export const updateBackupRetention = (
	siteId: number,
	retentionDays: RetentionPeriod
): UpdateRequestActionType => ( {
	type: JETPACK_BACKUP_RETENTION_UPDATE,
	siteId,
	retentionDays,
} );
