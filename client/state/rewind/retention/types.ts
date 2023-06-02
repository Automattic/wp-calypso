import {
	JETPACK_BACKUP_RETENTION_SET,
	JETPACK_BACKUP_RETENTION_UPDATE,
} from 'calypso/state/action-types';
import type { Action } from 'redux';

export type RetentionPeriod = 7 | 30 | 120 | 365;

export type UpdateRequestActionType = Action< typeof JETPACK_BACKUP_RETENTION_UPDATE > & {
	siteId: number;
	retentionDays: RetentionPeriod;
};

export type SetRetentionActionType = Action< typeof JETPACK_BACKUP_RETENTION_SET > & {
	siteId: number;
	retentionDays: RetentionPeriod;
};
