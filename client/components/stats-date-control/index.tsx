import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { Moment } from 'moment';
import qs from 'qs';
import { findShortcutForRange } from 'calypso/components/date-range/use-shortcuts';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import getSiteId from 'calypso/state/sites/selectors/get-site-id';
import DateControl from '../date-control';
import { DateRangePickerShortcut } from '../date-range/shortcuts';

type DateRange = {
	chartStart: string;
	chartEnd: string;
	daysInRange: number;
};
interface StatsDateControlProps {
	slug: string;
	queryParams: string;
	period: 'day' | 'week' | 'month' | 'year';
	dateRange: DateRange;
	shortcutList: DateRangePickerShortcut[];
	overlay?: JSX.Element;
	onGatedHandler: (
		events: { name: string; params?: object }[],
		event_from: string,
		stat_type: string
	) => void;
}

// Define the event name keys for tracking events
type EventNameKey =
	| 'today'
	| 'last_7_days'
	| 'last_30_days'
	| 'month_to_date'
	| 'last_12_months'
	| 'year_to_date'
	| 'last_3_years'
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
		today: 'jetpack_odyssey_stats_date_picker_shortcut_today_clicked',
		last_7_days: 'jetpack_odyssey_stats_date_picker_shortcut_last_7_days_clicked',
		last_30_days: 'jetpack_odyssey_stats_date_picker_shortcut_last_30_days_clicked',
		month_to_date: 'jetpack_odyssey_stats_date_picker_shortcut_month_to_date_clicked',
		last_12_months: 'jetpack_odyssey_stats_date_picker_shortcut_last_12_months_clicked',
		year_to_date: 'jetpack_odyssey_stats_date_picker_shortcut_year_to_date_clicked',
		last_3_years: 'jetpack_odyssey_stats_date_picker_shortcut_last_3_years_clicked',
		custom_date_range: 'jetpack_odyssey_stats_date_picker_shortcut_custom_date_range_clicked',
		apply_button: 'jetpack_odyssey_stats_date_picker_apply_button_clicked',
		trigger_button: 'jetpack_odyssey_stats_date_picker_opened',
	},
	calypso: {
		today: 'calypso_stats_date_picker_shortcut_today_clicked',
		last_7_days: 'calypso_stats_date_picker_shortcut_last_7_days_clicked',
		last_30_days: 'calypso_stats_date_picker_shortcut_last_30_days_clicked',
		month_to_date: 'calypso_stats_date_picker_shortcut_month_to_date_clicked',
		last_12_months: 'calypso_stats_date_picker_shortcut_last_12_months_clicked',
		year_to_date: 'calypso_stats_date_picker_shortcut_year_to_date_clicked',
		last_3_years: 'calypso_stats_date_picker_shortcut_last_3_years_clicked',
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
	onGatedHandler,
}: StatsDateControlProps ) => {
	// ToDo: Consider removing period from shortcuts.
	// We could use the bestPeriodForDays() helper and keep the shortcuts
	// consistent with the custom ranges.

	const moment = useLocalizedMoment();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const siteId = useSelector( ( state ) => getSiteId( state, slug ) );

	/**
	 * Remove start date from query params if it's out of range.
	 * @param queryParamsObject
	 * @param startDate
	 * @param endDate
	 */
	const removeOutOfRangeStartDate = (
		queryParamsObject: Record< string, any >,
		startDate: string,
		endDate: string
	): void => {
		const selectedStartDate = queryParamsObject.startDate as string | undefined;

		if ( selectedStartDate && ( selectedStartDate < startDate || selectedStartDate > endDate ) ) {
			// When there is no selected date, it takes today by default.
			delete queryParamsObject.startDate;
		}
	};

	// Shared link generation helper.
	const generateNewLink = ( period: string, startDate: string, endDate: string ) => {
		const queryParamsObject = qs.parse( queryParams );
		removeOutOfRangeStartDate( queryParamsObject, startDate, endDate );

		const newRangeQuery = qs.stringify(
			Object.assign( {}, queryParamsObject, { chartStart: startDate, chartEnd: endDate } ),
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
		let period = bestPeriodForDays( rangeInDays );

		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( eventNames[ event_from ][ 'apply_button' ] );

		const appliedShortcut = findShortcutForRange( shortcutList, {
			chartStart: startDate,
			chartEnd: endDate,
		} );

		if ( appliedShortcut && appliedShortcut.id ) {
			localStorage.setItem(
				`jetpack_stats_stored_date_range_shortcut_id_${ siteId }`,
				appliedShortcut.id
			);
			// Remove legacy item key.
			localStorage.removeItem( 'jetpack_stats_stored_date_range_shortcut_id' );

			// Apply the period from the found shortcut.
			period = appliedShortcut.period;
		}

		// Update chart via routing.
		setTimeout( () => page( generateNewLink( period, startDate, endDate ) ), 250 );
	};

	// handler for shortcut clicks
	const onShortcutClickHandler = (
		shortcut: DateRangePickerShortcut,
		closePopoverAndCommit: () => void
	) => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';

		if ( shortcut.isGated ) {
			onGatedHandler &&
				onGatedHandler(
					[ { name: eventNames[ event_from ][ shortcut.id as EventNameKey ] } ],
					event_from,
					shortcut.statType ?? shortcut.id
				);
		} else {
			recordTracksEvent( eventNames[ event_from ][ shortcut.id as EventNameKey ] );
			closePopoverAndCommit();
		}
	};

	return (
		<DateControl
			dateRange={ dateRange }
			onApplyButtonClick={ ( startDate: Moment, endDate: Moment ) =>
				onApplyButtonHandler( startDate.format( 'YYYY-MM-DD' ), endDate.format( 'YYYY-MM-DD' ) )
			}
			onShortcutClick={ onShortcutClickHandler }
			onDateControlClick={ () => {
				const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
				recordTracksEvent( eventNames[ event_from ][ 'trigger_button' ] );
			} }
			tooltip={ translate( 'Filter all data by date' ) }
			overlay={ overlay }
			shortcutList={ shortcutList }
		/>
	);
};

export { StatsDateControl as default, StatsDateControl };
