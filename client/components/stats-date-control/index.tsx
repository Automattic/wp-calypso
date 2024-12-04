import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { translate } from 'i18n-calypso';
import { Moment } from 'moment';
import qs from 'qs';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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
	// Temporary prop to enable new date filtering UI.
	isNewDateFilteringEnabled: boolean;
}

// Define the event name keys for tracking events
type EventNameKey =
	| 'today'
	| 'yesterday'
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
		today: 'jetpack_odyssey_stats_date_picker_shortcut_today_clicked',
		yesterday: 'jetpack_odyssey_stats_date_picker_shortcut_yesterday_clicked',
		last_7_days: 'jetpack_odyssey_stats_date_picker_shortcut_last_7_days_clicked',
		last_30_days: 'jetpack_odyssey_stats_date_picker_shortcut_last_30_days_clicked',
		last_3_months: 'jetpack_odyssey_stats_date_picker_shortcut_last_3_months_clicked',
		last_year: 'jetpack_odyssey_stats_date_picker_shortcut_last_year_clicked',
		custom_date_range: 'jetpack_odyssey_stats_date_picker_shortcut_custom_date_range_clicked',
		apply_button: 'jetpack_odyssey_stats_date_picker_apply_button_clicked',
		trigger_button: 'jetpack_odyssey_stats_date_picker_opened',
	},
	calypso: {
		today: 'calypso_stats_date_picker_shortcut_today_clicked',
		yesterday: 'calypso_stats_date_picker_shortcut_yesterday_clicked',
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
	onGatedHandler,
	isNewDateFilteringEnabled = false,
}: StatsDateControlProps ) => {
	// ToDo: Consider removing period from shortcuts.
	// We could use the bestPeriodForDays() helper and keep the shortcuts
	// consistent with the custom ranges.

	const moment = useLocalizedMoment();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

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
		const period = bestPeriodForDays( rangeInDays );

		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( eventNames[ event_from ][ 'apply_button' ] );

		// Update chart via routing.
		setTimeout( () => page( generateNewLink( period, startDate, endDate ) ), 250 );
	};

	// handler for shortcut clicks
	const onShortcutClickHandler = ( shortcut: DateRangePickerShortcut ) => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		if ( shortcut.isGated ) {
			onGatedHandler &&
				onGatedHandler(
					[ { name: eventNames[ event_from ][ shortcut.id as EventNameKey ] } ],
					event_from,
					shortcut.statType ?? shortcut.id
				);
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
			tooltip={ isNewDateFilteringEnabled ? translate( 'Filter all data by date' ) : '' }
			overlay={ overlay }
			shortcutList={ shortcutList }
			isNewDateFilteringEnabled={ isNewDateFilteringEnabled }
		/>
	);
};

export { StatsDateControl as default, StatsDateControl };
