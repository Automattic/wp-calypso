import type { Activity } from 'calypso/state/activity-log/types';

export type ActivityLogEntry = Activity & {
	activityIsRewindable: boolean;
	activityStatus?: string;
	activityGroup?: string;
	streams?: ActivityLogEntry[];
	streamCount?: number;
	isAggregate?: boolean;
};

export type ActivityTypeGroup = {
	key: string;
	name: string;
	count: number;
};

export type ActivityActorOption = {
	key: string;
	name: string;
	count?: number;
};
