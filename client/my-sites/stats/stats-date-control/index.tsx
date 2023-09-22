import React from 'react';
import IntervalDropdown from '../stats-interval-dropdown';
import DateControlPicker from './stats-date-control-picker';
import { StatsDateControlProps } from './types';

const COMPONENT_CLASS_NAME = 'stats-date-control';

const StatsDateControl = ( { slug, queryParams, period, pathTemplate }: StatsDateControlProps ) => {
	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<IntervalDropdown period={ period } pathTemplate={ pathTemplate } />
			<DateControlPicker slug={ slug } queryParams={ queryParams } />
		</div>
	);
};

export { StatsDateControl as default, StatsDateControl, COMPONENT_CLASS_NAME };
