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

	const hours = parseInt( hour ) + ( period === 'pm' ? 12 : 0 );
	event.setHours( hours, 0, 0, 0 );

	if ( frequency === 'daily' ) {
		// Set next day
		event.setDate( event.getDate() + 1 );
	}

	if ( frequency === 'weekly' ) {
		// Set first next selected day
		event.setDate( event.getDate() + ( ( parseInt( day ) + 7 - event.getDay() ) % 7 || 7 ) );
	}

	// return timestamp in seconds
	return event.getTime() / 1000;
};

/**
 * Validate name
 * - required
 * - max length 120
 */
export const validateName = ( name: string ) => {
	let error = '';
	if ( ! name ) {
		error = 'Please provide a name to this plugin update schedule.';
	} else if ( name.length > 120 ) {
		error = 'Please provide a shorter name.';
	}

	return error;
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

	existingSchedules.forEach( ( schedule ) => {
		if ( error ) {
			return;
		}

		const existingDate = new Date( schedule.timestamp * 1000 );

		if (
			( newSchedule.frequency === 'daily' || schedule.frequency === 'daily' ) &&
			existingDate.getHours() === newDate.getHours()
		) {
			error = 'Please choose another time, as this slot is already scheduled.';
		} else if (
			newSchedule.frequency === 'weekly' &&
			schedule.frequency === 'weekly' &&
			newDate.getDay() === existingDate.getDay() &&
			newDate.getHours() === existingDate.getHours()
		) {
			error = 'Please pick another time for optimal performance, as this slot is already taken.';
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
		error = 'Please select at least one plugin to update.';
	} else if ( existingPlugins.length ) {
		const _plugins = [ ...plugins ].sort();

		existingPlugins.forEach( ( existing ) => {
			if ( JSON.stringify( _plugins ) === JSON.stringify( [ ...existing ].sort() ) ) {
				error = 'Please select a different set of plugins, as this one has already been chosen.';
			}
		} );
	}

	return error;
};
