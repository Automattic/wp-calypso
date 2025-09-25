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
