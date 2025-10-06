import type { WEEKDAYS } from './constants';
import type { Site } from '@automattic/api-core';

export type Weekday = ( typeof WEEKDAYS )[ number ];
export type Frequency = 'daily' | 'weekly';
export type TimeSlot = { frequency: Frequency; timestamp: number };
export type ScheduleCollisions = {
	timeCollisions: { error: string; collidingSiteIds: number[] };
	pluginCollisions: { error: string; collidingSiteIds: number[] };
};

export interface ScheduledUpdateRow {
	id: string;
	site: Site;
	lastUpdate: number | null;
	nextUpdate: number;
	active: boolean;
	schedule: Frequency;
	scheduleId: string;
}
