import moment from 'moment';
import React from 'react';
import IntervalDropdown from '../stats-interval-dropdown';
import DateControlPicker from './stats-date-control-picker';
import { StatsDateControlProps } from './types';
import './style.scss';

const COMPONENT_CLASS_NAME = 'stats-date-control';

const shortcutList = [
	{
		id: 'today',
		label: 'Today',
		offset: 0,
		range: 0,
	},
	{
		id: 'yesterday',
		label: 'Yesterday',
		offset: 1,
		range: 0,
	},
	{
		id: 'last-7-days',
		label: 'Last 7 Days',
		offset: 0,
		range: 7,
	},
	{
		id: 'last-30-days',
		label: 'Last 30 Days',
		offset: 0,
		range: 30,
	},
	{
		id: 'last-year',
		label: 'Last Year',
		offset: 0,
		range: 365,
	},
];

const StatsDateControl = ( {
	slug,
	queryParams,
	period,
	pathTemplate,
	onChangeChartQuantity,
}: StatsDateControlProps ) => {
	const handleApply = ( startDate: string, endDate: string ) => {
		// calculate offset between start and end to influcence the number of points for the chart
		// TODO: take period into account
		const offset = Math.abs( moment( endDate ).diff( moment( startDate ), 'days' ) );

		// TODO: add period update if the offet is too big to accomodate the chart

		onChangeChartQuantity( offset + 1 );
	};

	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<IntervalDropdown period={ period } pathTemplate={ pathTemplate } />
			<DateControlPicker
				slug={ slug }
				queryParams={ queryParams }
				shortcutList={ shortcutList }
				handleApply={ handleApply }
			/>
		</div>
	);
};

export { StatsDateControl as default, StatsDateControl, COMPONENT_CLASS_NAME };
