import { translate } from 'i18n-calypso';

/**
 * Prepare unix timestamp in seconds
 * based on selected frequency, day, hour and period
 */
export const prepareTimestamp = (
	frequency: string,
	day: string,
	hour: string,
	period: string
) => {
	const event = new Date();
	const now = new Date();

	let hours = parseInt( hour ) % 12; // Get the hour value (0-11).
	hours += period === 'pm' ? 12 : 0; // Add 12 if period is 'pm'.
	hours %= 24; // Ensure the hour is in the range of 0-23.
	event.setHours( hours, 0, 0, 0 );

	// If the selected hour is in the past, advance to the next day.
	if ( frequency === 'daily' && event < now ) {
		event.setDate( event.getDate() + 1 );
	}

	if ( frequency === 'weekly' ) {
		// Calculate the difference between the target day and today.
		let dayDifference = parseInt( day ) - now.getDay();

		// If the target day is today and the selected hour is in the past, advance to the next week.
		if ( dayDifference === 0 && event < now ) {
			dayDifference += 7;
		}

		// Set the date to the next selected day.
		event.setDate( event.getDate() + dayDifference + ( dayDifference < 0 ? 7 : 0 ) );
	}

	// return timestamp in seconds
	return event.getTime() / 1000;
};

export const convertHourTo24 = ( hour: string, period: string ): string => {
	if ( period === 'pm' ) {
		return hour === '12' ? '12' : ( parseInt( hour, 10 ) + 12 ).toString();
	}

	return hour;
};

export const convertHourTo12 = ( hour: string ): string => {
	const _hour = parseInt( hour, 10 );

	if ( _hour === 0 ) {
		return '12';
	}

	return _hour > 12 ? ( _hour - 12 ).toString() : _hour.toString();
};

type TimeSlot = {
	frequency: string;
	timestamp: number;
};
/**
 * Validate time slot
 * based on existing schedules in context of frequency
 */
export const validateTimeSlot = ( newSchedule: TimeSlot, existingSchedules: TimeSlot[] = [] ) => {
	let error = '';
	const newDate = new Date( newSchedule.timestamp * 1000 );

	// prepareTimestamp should always return a future date, but we need to catch it if it doesn't.
	if ( newDate < new Date() ) {
		error = 'Please choose a time in the future for this schedule.';
	}

	existingSchedules.forEach( ( schedule ) => {
		if ( error ) {
			return;
		}

		const existingDate = new Date( schedule.timestamp * 1000 );

		if (
			( newSchedule.frequency === 'daily' || schedule.frequency === 'daily' ) &&
			existingDate.getHours() === newDate.getHours()
		) {
			error = translate( 'Please choose another time, as this slot is already scheduled.' );
		} else if (
			newSchedule.frequency === 'weekly' &&
			schedule.frequency === 'weekly' &&
			newDate.getDay() === existingDate.getDay() &&
			newDate.getHours() === existingDate.getHours()
		) {
			error = translate( 'Please choose another time, as this slot is already scheduled.' );
		}
	} );

	return error;
};

/**
 * Validate plugins
 * compared with existing scheduled plugins
 */
export const validatePlugins = ( plugins: string[], existingPlugins: Array< string[] > = [] ) => {
	let error = '';

	if ( plugins.length === 0 ) {
		error = translate( 'Please select at least one plugin to update.' );
	} else if ( existingPlugins.length ) {
		const _plugins = [ ...plugins ].sort();

		existingPlugins.forEach( ( existing ) => {
			if ( JSON.stringify( _plugins ) === JSON.stringify( [ ...existing ].sort() ) ) {
				error = translate(
					'Please select a different set of plugins, as this one has already been chosen.'
				);
			}
		} );
	}

	return error;
};
