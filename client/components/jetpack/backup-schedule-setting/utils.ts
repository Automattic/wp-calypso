/**
 * Converts a given hour into a time range string, either in UTC or local time.
 * The resulting time range shows a start time and an end time 59 minutes later.
 *
 * - For local times, the start time is displayed in 12-hour format without AM/PM,
 * while the end time includes AM/PM.
 * - For UTC, the time range is displayed in 24-hour format for both start and end times.
 * @param {any} momentInstance - A moment.js instance used for time manipulation.
 * @param {number} hour - The hour of the day (0-23) for which to generate the time range.
 * @param {boolean} isUtc - Whether to generate the time range in UTC (true) or local time (false).
 * @returns {string} - A formatted string representing the time range.
 */
export const convertHourToRange = (
	momentInstance: any,
	hour: number,
	isUtc: boolean = false
): string => {
	const time = isUtc
		? momentInstance.utc().startOf( 'day' ).hour( hour )
		: momentInstance().startOf( 'day' ).hour( hour );

	const startTimeFormat = isUtc ? 'HH:mm' : 'h:mm';
	const endTimeFormat = isUtc ? 'HH:mm' : 'h:mm A';

	const startTime = time.format( startTimeFormat );
	const endTime = time.add( 59, 'minutes' ).format( endTimeFormat );

	return `${ startTime }-${ endTime }`;
};
