import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Tooltip } from '@wordpress/components';
import { Icon, calendar } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { Moment } from 'moment';
import qs from 'qs';
import { RefObject } from 'react';
import DateRange from 'calypso/components/date-range';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { StatsDateControlProps } from './types';
import './style.scss';

const COMPONENT_CLASS_NAME = 'stats-date-control';

// Define the event name keys for tracking events
type EventNameKey =
	| 'last_7_days'
	| 'last_30_days'
	| 'last_3_months'
	| 'last_year'
	| 'custom_date_range'
	| 'apply_button'
	| 'trigger_button';

// Define the structure for tracking event names
interface EventNames {
	jetpack_odyssey: Record< EventNameKey, string >;
	calypso: Record< EventNameKey, string >;
}

// Define the tracking event names object. Hardcoding event names ensures consistency, searchability, and prevents errors per Tracks naming conventions.
const eventNames: EventNames = {
	jetpack_odyssey: {
		last_7_days: 'jetpack_odyssey_stats_date_picker_shortcut_last_7_days_clicked',
		last_30_days: 'jetpack_odyssey_stats_date_picker_shortcut_last_30_days_clicked',
		last_3_months: 'jetpack_odyssey_stats_date_picker_shortcut_last_3_months_clicked',
		last_year: 'jetpack_odyssey_stats_date_picker_shortcut_last_year_clicked',
		custom_date_range: 'jetpack_odyssey_stats_date_picker_shortcut_custom_date_range_clicked',
		apply_button: 'jetpack_odyssey_stats_date_picker_apply_button_clicked',
		trigger_button: 'jetpack_odyssey_stats_date_picker_opened',
	},
	calypso: {
		last_7_days: 'calypso_stats_date_picker_shortcut_last_7_days_clicked',
		last_30_days: 'calypso_stats_date_picker_shortcut_last_30_days_clicked',
		last_3_months: 'calypso_stats_date_picker_shortcut_last_3_months_clicked',
		last_year: 'calypso_stats_date_picker_shortcut_last_year_clicked',
		custom_date_range: 'calypso_stats_date_picker_shortcut_custom_date_range_clicked',
		apply_button: 'calypso_stats_date_picker_apply_button_clicked',
		trigger_button: 'calypso_stats_date_picker_opened',
	},
};

const StatsDateControl = ( {
	slug,
	queryParams,
	dateRange,
	shortcutList,
	overlay,
}: StatsDateControlProps ) => {
	// ToDo: Consider removing period from shortcuts.
	// We could use the bestPeriodForDays() helper and keep the shortcuts
	// consistent with the custom ranges.

	const moment = useLocalizedMoment();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isNewDateFilteringEnabled = config.isEnabled( 'stats/new-date-filtering' );

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

	// handler for shortcut clicks
	const onShortcutClickHandler = ( shortcutId: EventNameKey ) => {
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
						<Tooltip
							text={ isNewDateFilteringEnabled ? translate( 'Filter all data by date' ) : '' }
							placement="bottom-end"
						>
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
						</Tooltip>
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
		</div>
	);
};

export { StatsDateControl as default, StatsDateControl, COMPONENT_CLASS_NAME };
