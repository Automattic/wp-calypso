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
	if ( period === 'am' ) {
		return hour === '12' ? '0' : hour;
	} else if ( period === 'pm' ) {
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

/**
 * Prepare relative path
 * based on URL or relative path
 */
export const prepareRelativePath = ( url: string ): string => {
	const value = url.trim();

	// Check if the value is a URL without a protocol
	const urlRegex = /^(?!https?:\/\/)[\w.]+(?:\.[\w]+)+[\w\-._~:/?#[\]@!$&'()*+,;=%]*$/i;
	const withoutProtocol = urlRegex.test( value );

	try {
		const _url = new URL( withoutProtocol ? `http://${ value }` : value );
		return `${ _url.pathname }${ _url.search }${ _url.hash }`;
	} catch ( e ) {
		return value.startsWith( '/' ) ? value : `/${ value }`;
	}
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

/**
 * Validate sites
 * check if at least one site is selected
 */
export const validateSites = ( sites: number[] ): string => {
	return sites.length === 0 ? translate( 'Please select at least one site.' ) : '';
};

/**
 * Validate path
 * check if path passes URL_PATH_REGEX
 */
export const validatePath = ( path: string, paths: string[] ): string => {
	const URL_PATH_REGEX = /^\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*$/;
	let error = '';

	// leading slash is required
	if ( path.length <= 1 ) {
		error = translate( 'Please enter a path.' );
	} else if ( ! URL_PATH_REGEX.test( path ) ) {
		error = translate( 'Please enter a valid path.' );
	} else if ( paths.includes( path ) ) {
		error = translate( 'This path is already added.' );
	}

	return error;
};

/* Validate paths
 * check if path is submitted before saving the schedule
 */
export const validatePaths = ( hasUnsubmittedPath: boolean ): string => {
	let error = '';
	if ( hasUnsubmittedPath ) {
		error = translate( 'Please submit the path before saving the schedule.' );
	}
	return error;
};
