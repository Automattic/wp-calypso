import type { Activity } from 'calypso/state/activity-log/types';

export type BackupActivity = Activity & {
	activityIsRewindable?: boolean;
	activityStatus?: string;
};
