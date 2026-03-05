/**
 * Parses a requestedSchedule and returns the schedule type.
 * Previously we didn't have requested_schedule field and in this case we receive raw schedule here instead of daily/weekly/2h/5w/etc, so we need to parse it and return expected schedule type.
 *
 * Patterns:
 * - Hourly: `M * * * *`
 * - Twice daily: `M H1,H2 * * *`
 * - Daily: `M H * * *`
 * - Weekly: `M H * * D`
 */
export function parseRequestedScheduleForBackwardCompatibility(
	requestedSchedule: string
): string {
	// Guard against missing values from older API responses.
	if ( ! requestedSchedule ) {
		return 'hourly';
	}

	// Predefined schedule names pass through
	if ( [ 'hourly', 'twicedaily', 'daily', 'weekly' ].includes( requestedSchedule ) ) {
		return requestedSchedule;
	}

	// Shorthand notation passes through
	if ( /^\d+[hdw]$/.test( requestedSchedule ) ) {
		return requestedSchedule;
	}

	const parts = requestedSchedule.trim().split( /\s+/ );

	if ( parts.length === 5 ) {
		const [ minute, hour, dayOfMonth, month, dayOfWeek ] = parts;

		// Hourly: specific minute, wildcard for everything else
		if (
			/^\d+$/.test( minute ) &&
			hour === '*' &&
			dayOfMonth === '*' &&
			month === '*' &&
			dayOfWeek === '*'
		) {
			return 'hourly';
		}

		// Twice daily: specific minute, two hours (comma-separated), wildcard for day/month/weekday
		if (
			/^\d+$/.test( minute ) &&
			/^\d+,\d+$/.test( hour ) &&
			dayOfMonth === '*' &&
			month === '*' &&
			dayOfWeek === '*'
		) {
			return 'twicedaily';
		}

		// Daily: specific minute and hour, wildcard for day/month/weekday
		if (
			/^\d+$/.test( minute ) &&
			/^\d+$/.test( hour ) &&
			dayOfMonth === '*' &&
			month === '*' &&
			dayOfWeek === '*'
		) {
			return 'daily';
		}

		// Weekly: specific minute, hour, and day of week
		if (
			/^\d+$/.test( minute ) &&
			/^\d+$/.test( hour ) &&
			dayOfMonth === '*' &&
			month === '*' &&
			/^\d+$/.test( dayOfWeek )
		) {
			return 'weekly';
		}
	}

	// Default to hourly for any unrecognized value
	return 'hourly';
}
