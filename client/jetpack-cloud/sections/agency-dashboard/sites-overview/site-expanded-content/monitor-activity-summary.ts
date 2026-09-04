import moment from 'moment';

const MINUTES_IN_A_DAY = 24 * 60;

export interface MonitorActivityDay {
	date: string;
	status: string;
	downtime_in_minutes?: number;
}

export interface MonitorActivitySummary {
	monitoredDays: number;
	downtimeEvents: number;
	// Null when the API did not report a duration for every day that had downtime.
	downtimeInMinutes: number | null;
	// Null when nothing has been monitored yet, or when the downtime durations are incomplete.
	uptimeFraction: number | null;
}

/**
 * The uptime endpoint reports one entry per day, so uptime and total downtime can only be
 * stated truthfully when every day with downtime came back with a duration. When any of them
 * is missing, both figures are reported as null so the caller can leave them out rather than
 * understate the outage.
 */
export function getMonitorActivitySummary( days: MonitorActivityDay[] ): MonitorActivitySummary {
	const monitoredDays = days.filter( ( { status } ) => status === 'up' || status === 'down' );
	const downDays = monitoredDays.filter( ( { status } ) => status === 'down' );

	const hasDowntimeDurations = downDays.every(
		( { downtime_in_minutes } ) => typeof downtime_in_minutes === 'number'
	);

	if ( ! monitoredDays.length || ! hasDowntimeDurations ) {
		return {
			monitoredDays: monitoredDays.length,
			downtimeEvents: downDays.length,
			downtimeInMinutes: null,
			uptimeFraction: null,
		};
	}

	const downtimeInMinutes = downDays.reduce(
		( total, { downtime_in_minutes } ) => total + ( downtime_in_minutes ?? 0 ),
		0
	);
	const monitoredMinutes = monitoredDays.length * MINUTES_IN_A_DAY;

	return {
		monitoredDays: monitoredDays.length,
		downtimeEvents: downDays.length,
		downtimeInMinutes,
		uptimeFraction: Math.max( monitoredMinutes - downtimeInMinutes, 0 ) / monitoredMinutes,
	};
}

export function formatDowntimeDuration( downtimeInMinutes: number ): string {
	const duration = moment.duration( downtimeInMinutes, 'minutes' );

	const days = duration.days();
	const hours = duration.hours();
	const minutes = duration.minutes();

	const formattedDays = days > 0 ? `${ days }d ` : '';
	const formattedHours = hours > 0 ? `${ hours }h ` : '';
	const formattedMinutes = minutes > 0 ? `${ minutes }m` : '';

	return `${ formattedDays }${ formattedHours }${ formattedMinutes }`.trim() || '0m';
}
