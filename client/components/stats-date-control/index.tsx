import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import qs from 'qs';
import React from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DateControlPicker from './stats-date-control-picker';
import { StatsDateControlProps, DateControlPickerShortcut } from './types';
import './style.scss';

const COMPONENT_CLASS_NAME = 'stats-date-control';

const StatsDateControl = ( { slug, queryParams, dateRange }: StatsDateControlProps ) => {
	// ToDo: Consider removing period from shortcuts.
	// We could use the bestPeriodForDays() helper and keep the shortcuts
	// consistent with the custom ranges.

	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const shortcutList = [
		{
			id: 'last-7-days',
			label: translate( 'Last 7 Days' ),
			offset: 0,
			range: 6,
			period: 'day',
		},
		{
			id: 'last-30-days',
			label: translate( 'Last 30 Days' ),
			offset: 0,
			range: 29,
			period: 'day',
		},
		{
			id: 'last-3-months',
			label: translate( 'Last 90 Days' ),
			offset: 0,
			range: 89,
			period: 'week',
		},
		{
			id: 'last-year',
			label: translate( 'Last Year' ),
			offset: 0,
			range: 364, // ranges are zero based!
			period: 'month',
		},
	];

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

	// Determine period based on number of days in date range.
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

	// Handler for Apply button.
	const onApplyButtonHandler = ( startDate: string, endDate: string ) => {
		// Determine period based on date range.
		const rangeInDays = Math.abs( moment( endDate ).diff( moment( startDate ), 'days' ) );
		const period = bestPeriodForDays( rangeInDays );

		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_date_picker_apply_button_clicked` );

		// Update chart via routing.
		setTimeout( () => page( generateNewLink( period, startDate, endDate ) ), 250 );
	};

	// Handler for shortcut selection.
	const onShortcutHandler = ( shortcut: DateControlPickerShortcut ) => {
		// Generate new dates.
		const anchor = moment().subtract( shortcut.offset, 'days' );
		const endDate = anchor.format( 'YYYY-MM-DD' );
		const startDate = anchor.subtract( shortcut.range, 'days' ).format( 'YYYY-MM-DD' );

		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_date_picker_shortcut_${ shortcut.id }_clicked` );

		// Update chart via routing.
		setTimeout( () => page( generateNewLink( shortcut.period, startDate, endDate ) ), 250 );
	};

	const getShortcutForRange = () => {
		// Search the shortcut array for something matching the current date range.
		// Returns shortcut or null;
		const today = moment().format( 'YYYY-MM-DD' );
		const yesterday = moment().subtract( 1, 'days' ).format( 'YYYY-MM-DD' );
		const shortcut = shortcutList.find( ( element ) => {
			if (
				yesterday === dateRange.chartEnd &&
				dateRange.daysInRange === element.range + 1 &&
				element.id === 'yesterday'
			) {
				return element;
			}
			if ( today === dateRange.chartEnd && dateRange.daysInRange === element.range + 1 ) {
				return element;
			}
			return null;
		} );
		return shortcut;
	};

	const getButtonLabel = () => {
		// Test for a shortcut match.
		const shortcut = getShortcutForRange();
		if ( shortcut ) {
			return shortcut.label;
		}
		// Generate a full date range for the label.
		const startDate = moment( dateRange.chartStart ).format( 'MMMM Do, YYYY' );
		const endDate = moment( dateRange.chartEnd ).format( 'MMMM Do, YYYY' );
		return `${ startDate } - ${ endDate }`;
	};

	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<DateControlPicker
				buttonLabel={ getButtonLabel() }
				dateRange={ dateRange }
				shortcutList={ shortcutList }
				selectedShortcut={ getShortcutForRange()?.id }
				onShortcut={ onShortcutHandler }
				onApply={ onApplyButtonHandler }
			/>
		</div>
	);
};

export { StatsDateControl as default, StatsDateControl, COMPONENT_CLASS_NAME };
