import { createSelector } from '@automattic/state-utils';
import { translate as i18nCalypsoTranslate, useTranslate } from 'i18n-calypso';
import { getMomentSiteZone } from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DateRangePickerShortcut } from './shortcuts';

export const DATERANGE_PERIOD = {
	HOUR: 'hour',
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
	YEAR: 'year',
};

const DATE_FORMAT = 'YYYY-MM-DD';

export const findShortcutForRange = (
	supportedShortcutList: DateRangePickerShortcut[],
	dateRange: { chartStart: string; chartEnd: string; shortcutId?: string }
) => {
	if ( ( ! dateRange?.chartEnd || ! dateRange?.chartStart ) && ! dateRange?.shortcutId ) {
		return null;
	}
	// Search the shortcut array for something matching the current date range.
	// Returns shortcut or null;
	const shortcut = supportedShortcutList.find( ( element ) => {
		if ( element.id === dateRange.shortcutId ) {
			return element;
		}

		if (
			! dateRange.shortcutId &&
			element.endDate === dateRange.chartEnd &&
			element.startDate === dateRange.chartStart
		) {
			return element;
		}

		return null;
	} );

	return shortcut;
};

export const getShortcuts = createSelector(
	(
		state: object,
		dateRange: {
			chartStart: string;
			chartEnd: string;
			shortcutId?: string;
		},
		translateFromProps
	) => {
		const translate = translateFromProps ?? i18nCalypsoTranslate;
		const siteId = getSelectedSiteId( state );
		const siteToday = getMomentSiteZone( state, siteId );
		const siteTodayStr = siteToday.format( DATE_FORMAT );

		const supportedShortcutList = [
			{
				id: 'today',
				label: translate( 'Today' ),
				startDate: siteTodayStr,
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.HOUR,
			},
			{
				id: 'last_7_days',
				label: translate( 'Last 7 Days' ),
				startDate: siteToday.clone().subtract( 6, 'days' ).format( DATE_FORMAT ),
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.DAY,
			},
			{
				id: 'last_30_days',
				label: translate( 'Last 30 Days' ),
				startDate: siteToday.clone().subtract( 29, 'days' ).format( DATE_FORMAT ),
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.DAY,
			},
			{
				id: 'month_to_date',
				label: translate( 'Month to date' ),
				startDate: siteToday.clone().startOf( 'month' ).format( DATE_FORMAT ),
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.DAY,
			},
			{
				id: 'last_12_months',
				label: translate( 'Last 12 months' ),
				startDate: siteToday
					.clone()
					.startOf( 'month' )
					.subtract( 11, 'months' )
					.format( DATE_FORMAT ),
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.MONTH,
			},
			// Temporarily hide this shortcut before we resolve the issue of identifying shortcuts.
			{
				id: 'year_to_date',
				label: translate( 'Year to date' ),
				startDate: siteToday.clone().startOf( 'year' ).format( DATE_FORMAT ),
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.MONTH,
			},
			{
				id: 'last_3_years',
				label: translate( 'Last 3 years' ),
				startDate: siteToday.clone().startOf( 'year' ).subtract( 2, 'years' ).format( DATE_FORMAT ),
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.YEAR,
			},
			{
				id: 'custom_date_range',
				label: translate( 'Custom Range' ),
				startDate: '',
				endDate: '',
				period: DATERANGE_PERIOD.DAY,
			},
		];

		return {
			selectedShortcut: findShortcutForRange( supportedShortcutList, dateRange ),
			supportedShortcutList,
		};
	},
	(
		state: object,
		dateRange: {
			chartStart: string;
			chartEnd: string;
			shortcutId?: string;
		}
	) => {
		const siteId = getSelectedSiteId( state );
		const siteToday = getMomentSiteZone( state, siteId );

		return [
			siteId,
			siteToday.format( DATE_FORMAT ),
			dateRange?.chartStart,
			dateRange?.chartEnd,
			dateRange?.shortcutId,
		];
	}
);

export function useShortcuts( dateRange: {
	chartStart: string;
	chartEnd: string;
	shortcutId?: string;
} ) {
	const translate = useTranslate();
	const shortcuts = useSelector( ( state ) => getShortcuts( state, dateRange, translate ) );

	return shortcuts;
}
