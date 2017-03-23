
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CalendarButton from 'blocks/calendar-button';

const CalendarButtonExample = () => {
	const tomorrow = new Date( new Date().getTime() + 24 * 60 * 60 * 1000 );
	return (
		<CalendarButton primary selectedDay={ tomorrow } />
	);
};

export default CalendarButtonExample;
