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
