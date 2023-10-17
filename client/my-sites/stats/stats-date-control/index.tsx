import moment from 'moment';
import page from 'page';
import qs from 'qs';
import React from 'react';
import IntervalDropdown from '../stats-interval-dropdown';
import DateControlPicker from './stats-date-control-picker';
import { StatsDateControlProps, DateControlPickerShortcut } from './types';
import './style.scss';

const COMPONENT_CLASS_NAME = 'stats-date-control';

const shortcutList = [
	{
		id: 'today',
		label: 'Today',
		offset: 0,
		range: 0,
		period: 'day',
	},
	{
		id: 'yesterday',
		label: 'Yesterday',
		offset: 1,
		range: 0,
		period: 'day',
	},
	{
		id: 'last-7-days',
		label: 'Last 7 Days',
		offset: 0,
		range: 6,
		period: 'day',
	},
	{
		id: 'last-30-days',
		label: 'Last 30 Days',
		offset: 0,
		range: 29,
		period: 'day',
	},
	{
		id: 'last-year',
		label: 'Last Year',
		offset: 0,
		range: 364, // ranges are zero based!
		period: 'month',
	},
];

const StatsDateControl = ( {
	slug,
	queryParams,
	period,
	pathTemplate,
	onChangeChartQuantity,
}: StatsDateControlProps ) => {
	// Shared link generation helper.
	const generateNewLink = ( period: string, startDate: string, endDate: string ) => {
		const newRangeQuery = qs.stringify(
			Object.assign( {}, queryParams, { chartStart: startDate, chartEnd: endDate } ),
			{
				addQueryPrefix: true,
			}
		);
		const url = `/stats/${ period }/${ slug }`;
		return `${ url }${ newRangeQuery }`;
	};

	const bestPeriodForDays = ( days: number ): string => {
		// 30 bars, one day is one bar
		if ( days <= 30 ) {
			return 'day';
		}
		// 25 bars, 7 days one bar
		if ( days <= 7 * 25 ) {
			return 'week';
		}
		// 25 bars, 30 days one bar
		if ( days <= 30 * 25 ) {
			return 'month';
		}
		return 'year';
	};

	// Previous Apply button handling.
	const handleApply = ( startDate: string, endDate: string ) => {
		// calculate offset between start and end to influcence the number of points for the chart
		// TODO: take period into account
		const offset = Math.abs( moment( endDate ).diff( moment( startDate ), 'days' ) );

		// TODO: add period update if the offet is too big to accomodate the chart

		onChangeChartQuantity( offset + 1 );
	};

	// New Apply button handling.
	const onApplyButtonHandler = ( startDate: string, endDate: string ) => {
		const rangeInDays = Math.abs( moment( endDate ).diff( moment( startDate ), 'days' ) );
		const period = bestPeriodForDays( rangeInDays );
		const href = generateNewLink( period, startDate, endDate );
		page( href );
	};

	// Handler for shortcut selection.
	const onShortcutHandler = ( shortcut: DateControlPickerShortcut ) => {
		// Generate new dates.
		const anchor = moment().subtract( shortcut.offset, 'days' );
		const endDate = anchor.format( 'YYYY-MM-DD' );
		const startDate = anchor.subtract( shortcut.range, 'days' ).format( 'YYYY-MM-DD' );

		const href = generateNewLink( shortcut.period, startDate, endDate );
		page( href );
	};

	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<IntervalDropdown period={ period } pathTemplate={ pathTemplate } />
			<DateControlPicker
				shortcutList={ shortcutList }
				onShortcut={ onShortcutHandler }
				onApply={ onApplyButtonHandler }
			/>
		</div>
	);
};

export { StatsDateControl as default, StatsDateControl, COMPONENT_CLASS_NAME };
