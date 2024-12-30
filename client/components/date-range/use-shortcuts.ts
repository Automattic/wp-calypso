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
};

const DATE_FORMAT = 'YYYY-MM-DD';

export const findShortcutForRange = (
	supportedShortcutList: DateRangePickerShortcut[],
	dateRange: { chartStart: string; chartEnd: string }
) => {
	if ( ! dateRange?.chartEnd || ! dateRange?.chartStart ) {
		return null;
	}
	// Search the shortcut array for something matching the current date range.
	// Returns shortcut or null;
	const shortcut = supportedShortcutList.find( ( element ) => {
		if ( element.endDate === dateRange.chartEnd && element.startDate === dateRange.chartStart ) {
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
		},
		translateFromProps
	) => {
		const translate = translateFromProps ?? i18nCalypsoTranslate;
		const siteId = getSelectedSiteId( state );
		const siteToday = getMomentSiteZone( state, siteId );
		const siteTodayStr = siteToday.format( DATE_FORMAT );
		const siteYesterday = siteToday.clone().subtract( 1, 'days' );
		const yesterdayStr = siteYesterday.format( DATE_FORMAT );

		const supportedShortcutList = [
			{
				id: 'today',
				label: translate( 'Today' ),
				startDate: siteTodayStr,
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.DAY,
			},
			{
				id: 'yesterday',
				label: translate( 'Yesterday' ),
				startDate: yesterdayStr,
				endDate: yesterdayStr,
				period: DATERANGE_PERIOD.DAY,
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
				id: 'last_3_months',
				label: translate( 'Last 90 Days' ),
				startDate: siteToday.clone().subtract( 89, 'days' ).format( DATE_FORMAT ),
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.WEEK,
			},
			{
				id: 'last_year',
				label: translate( 'Last Year' ),
				startDate: siteToday.clone().subtract( 364, 'days' ).format( DATE_FORMAT ),
				endDate: siteTodayStr,
				period: DATERANGE_PERIOD.MONTH,
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
		}
	) => {
		const siteId = getSelectedSiteId( state );
		const siteToday = getMomentSiteZone( state, siteId );

		return [ siteId, siteToday.format( DATE_FORMAT ), dateRange?.chartStart, dateRange?.chartEnd ];
	}
);

export function useShortcuts( dateRange: {
	chartStart: string;
	chartEnd: string;
	daysInRange: number;
} ) {
	const translate = useTranslate();
	const shortcuts = useSelector( ( state ) => getShortcuts( state, dateRange, translate ) );

	return shortcuts;
}
