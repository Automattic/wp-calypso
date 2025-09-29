export type Weekday =
	| 'Monday'
	| 'Tuesday'
	| 'Wednesday'
	| 'Thursday'
	| 'Friday'
	| 'Saturday'
	| 'Sunday';

export type Frequency = 'daily' | 'weekly';

export type TimeSlot = { frequency: Frequency; timestamp: number };

export type ScheduleCollisions = {
	timeCollisions: { error: string; collidingSiteIds: number[] };
	pluginCollisions: { error: string; collidingSiteIds: number[] };
};
