import React from 'react';
import DateControlPicker from './stats-date-control-picker';
import { StatsDateControlProps } from './types';

const COMPONENT_CLASS_NAME = 'stats-date-control';

const StatsDateControl = ( { slug, queryParams }: StatsDateControlProps ) => {
	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<DateControlPicker slug={ slug } queryParams={ queryParams } />
		</div>
	);
};

export { StatsDateControl as default, StatsDateControl, COMPONENT_CLASS_NAME };
