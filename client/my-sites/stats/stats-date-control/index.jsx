import React from 'react';
import IntervalDropdown from '../stats-interval-dropdown';

const DateControl = ( { period, pathTemplate } ) => {
	return (
		<div>
			<IntervalDropdown period={ period } pathTemplate={ pathTemplate } />
		</div>
	);
};

export default DateControl;
