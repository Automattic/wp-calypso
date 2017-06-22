/**
 * External Dependencies
 */
import React from 'react';

const handleDayMouseEnter = ( date, modifiers, onMouseEnter ) => event => {
	onMouseEnter( date, modifiers, event );
};

const handleDayMouseLeave = ( date, modifiers, onMouseLeave ) => event => {
	onMouseLeave( date, modifiers, event );
};

const DatePickerDay = ( { date, modifiers, onMouseEnter, onMouseLeave } ) => {
	return (
		<div
			className="date-picker__day"
			onMouseEnter={ handleDayMouseEnter( date, modifiers, onMouseEnter ) }
			onMouseLeave={ handleDayMouseLeave( date, modifiers, onMouseLeave ) }
		>
			{ date.getDate() }
		</div>
	);
};

export default DatePickerDay;
