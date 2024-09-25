import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { Icon, calendar } from '@wordpress/icons';
import { Moment } from 'moment';
import qs from 'qs';
import { RefObject } from 'react';
import DateRange from 'calypso/components/date-range';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DateControlPicker from './stats-date-control-picker';
import { StatsDateControlProps, DateControlPickerShortcut } from './types';
import './style.scss';

const COMPONENT_CLASS_NAME = 'stats-date-control';
const isCalendarEnabled = config.isEnabled( 'stats/date-picker-calendar' );

// Hardcoding event names ensures consistency, searchability, and prevents errors per Tracks naming conventions.
const eventNames = {
	jetpack_odyssey: {
		last_7_days: 'jetpack_odyssey_stats_date_picker_shortcut_last_7_days_click',
		last_30_days: 'jetpack_odyssey_stats_date_picker_shortcut_last_30_days_click',
		last_3_months: 'jetpack_odyssey_stats_date_picker_shortcut_last_3_months_click',
		last_year: 'jetpack_odyssey_stats_date_picker_shortcut_last_year_click',
		custom_date_range: 'jetpack_odyssey_stats_date_picker_shortcut_custom_date_range_click',
		apply_button: 'jetpack_odyssey_stats_date_picker_apply_button_click',
		trigger_button: 'jetpack_odyssey_stats_date_picker_trigger_click',
	},
	calypso: {
		last_7_days: 'calypso_stats_date_picker_shortcut_last_7_days_click',
		last_30_days: 'calypso_stats_date_picker_shortcut_last_30_days_click',
		last_3_months: 'calypso_stats_date_picker_shortcut_last_3_months_click',
		last_year: 'calypso_stats_date_picker_shortcut_last_year_click',
		custom_date_range: 'calypso_stats_date_picker_shortcut_custom_date_range_click',
		apply_button: 'calypso_stats_date_picker_apply_button_click',
		trigger_button: 'calypso_stats_date_picker_trigger_click',
	},
};

const StatsDateControl = ( {
	slug,
	queryParams,
	dateRange,
	shortcutList,
	overlay,
	onGatedHandler,
}: StatsDateControlProps ) => {
	// ToDo: Consider removing period from shortcuts.
	// We could use the bestPeriodForDays() helper and keep the shortcuts
	// consistent with the custom ranges.

	const moment = useLocalizedMoment();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

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
		recordTracksEvent( eventNames[ event_from ][ 'apply_button' ] );

		// Update chart via routing.
		setTimeout( () => page( generateNewLink( period, startDate, endDate ) ), 250 );
	};

	// Handler for shortcut selection.
	const onShortcutHandler = ( shortcut: DateControlPickerShortcut ) => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		// Generate new dates.
		const anchor = moment().subtract( shortcut.offset, 'days' );
		const endDate = anchor.format( 'YYYY-MM-DD' );
		const startDate = anchor.subtract( shortcut.range, 'days' ).format( 'YYYY-MM-DD' );

		recordTracksEvent( eventNames[ event_from ][ shortcut.id ] );

		// Update chart via routing.
		setTimeout( () => page( generateNewLink( shortcut.period, startDate, endDate ) ), 250 );
	};

	// handler for shortcut clicks in new updated DateRange component
	const onShortcutClickHandler = ( shortcutId: string ) => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( eventNames[ event_from ][ shortcutId ] );
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
		const startDate = moment( dateRange.chartStart ).format( 'LL' );
		const endDate = moment( dateRange.chartEnd ).format( 'LL' );
		return `${ startDate } - ${ endDate }`;
	};

	return (
		<div className={ COMPONENT_CLASS_NAME }>
			{ isCalendarEnabled ? (
				<DateRange
					selectedStartDate={ moment( dateRange.chartStart ) }
					selectedEndDate={ moment( dateRange.chartEnd ) }
					lastSelectableDate={ moment() }
					firstSelectableDate={ moment( '2010-01-01' ) }
					onDateCommit={ ( startDate: Moment, endDate: Moment ) =>
						startDate &&
						endDate &&
						onApplyButtonHandler( startDate.format( 'YYYY-MM-DD' ), endDate.format( 'YYYY-MM-DD' ) )
					}
					renderTrigger={ ( {
						onTriggerClick,
						buttonRef,
					}: {
						onTriggerClick: () => void;
						buttonRef: RefObject< typeof Button >;
					} ) => {
						return (
							<Button
								onClick={ () => {
									const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
									recordTracksEvent( eventNames[ event_from ][ 'trigger_button' ] );
									onTriggerClick();
								} }
								ref={ buttonRef }
							>
								{ getButtonLabel() }
								<Icon className="gridicon" icon={ calendar } />
							</Button>
						);
					} }
					rootClass="stats-date-control-picker"
					overlay={ overlay }
					displayShortcuts
					useArrowNavigation
					customTitle="Date Range"
					focusedMonth={ moment( dateRange.chartEnd ).toDate() }
					onShortcutClick={ onShortcutClickHandler }
				/>
			) : (
				<DateControlPicker
					buttonLabel={ getButtonLabel() }
					dateRange={ dateRange }
					shortcutList={ shortcutList }
					selectedShortcut={ getShortcutForRange()?.id }
					onShortcut={ onShortcutHandler }
					onApply={ onApplyButtonHandler }
					onGatedHandler={ onGatedHandler }
					overlay={ overlay }
				/>
			) }
		</div>
	);
};

export { StatsDateControl as default, StatsDateControl, COMPONENT_CLASS_NAME };
