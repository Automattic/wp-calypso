import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import page from 'page';
import qs from 'qs';
import React from 'react';
import IntervalDropdown from '../stats-interval-dropdown';
import DateControlPicker from './stats-date-control-picker';
import { StatsDateControlProps } from './types';
import './style.scss';

const COMPONENT_CLASS_NAME = 'stats-date-control';

const StatsDateControl = ( {
	slug,
	queryParams,
	period,
	pathTemplate,
	onChangeChartQuantity,
}: StatsDateControlProps ) => {
	const translate = useTranslate();

	const shortcutList = [
		{
			id: 'today',
			label: translate( 'Today' ),
			offset: 0,
			range: 0,
		},
		{
			id: 'yesterday',
			label: translate( 'Yesterday' ),
			offset: 1,
			range: 0,
		},
		{
			id: 'last-7-days',
			label: translate( 'Last 7 Days' ),
			offset: 0,
			range: 7,
		},
		{
			id: 'last-30-days',
			label: translate( 'Last 30 Days' ),
			offset: 0,
			range: 30,
		},
		{
			id: 'last-year',
			label: translate( 'Last Year' ),
			offset: 0,
			range: 365,
		},
		{
			id: 'all-time',
			label: 'All Time',
			offset: 0,
			range: 400, // TODO: Don't hard code this value.
		},
	];

	const handleApply = ( startDate: string, endDate: string ) => {
		// calculate offset between start and end to influcence the number of points for the chart
		// TODO: take period into account
		const offset = Math.abs( moment( endDate ).diff( moment( startDate ), 'days' ) );

		// set quntiry
		onChangeChartQuantity( offset + 1 );

		const nextDay = startDate;
		const nextDayQuery = qs.stringify( Object.assign( {}, queryParams, { startDate: nextDay } ), {
			addQueryPrefix: true,
		} );
		let period;

		if ( offset <= 30 ) {
			// 30 bars, one day is one bar
			period = 'day';
		} else if ( offset <= 7 * 25 ) {
			// 25 bars, 7 days one bar
			period = 'week';
		} else if ( offset <= 30 * 25 ) {
			// 25 bars, 30 days one bar
			period = 'month';
		} else {
			period = 'year';
		}

		const url = `/stats/${ period }/${ slug }`;
		const href = `${ url }${ nextDayQuery }`;

		// apply an interval
		page( href );
	};

	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<IntervalDropdown period={ period } pathTemplate={ pathTemplate } />
			<DateControlPicker shortcutList={ shortcutList } handleApply={ handleApply } />
		</div>
	);
};

export { StatsDateControl as default, StatsDateControl, COMPONENT_CLASS_NAME };
