import config from '@automattic/calypso-config';
import { createSelector } from '@automattic/state-utils';
import { translate, useTranslate } from 'i18n-calypso';
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

export const getShortcuts = createSelector(
	(
		state: object,
		dateRange: {
			chartStart: string;
			chartEnd: string;
		},
		translateFunction = translate,
		isNewDateFilteringEnabled = config.isEnabled( 'stats/new-date-filtering' )
	) => {
		const siteId = getSelectedSiteId( state );
		const siteToday = getMomentSiteZone( state, siteId );
		const siteTodayStr = siteToday.format( DATE_FORMAT );
		const siteYesterday = isNewDateFilteringEnabled
			? siteToday.clone().subtract( 1, 'days' )
			: siteToday.clone();
		const yesterdayStr = siteYesterday.format( DATE_FORMAT );

		const supportedShortcutList = [
			{
				id: 'last_7_days',
				label: translateFunction( 'Last 7 Days' ),
				startDate: siteYesterday.clone().subtract( 6, 'days' ).format( DATE_FORMAT ),
				endDate: yesterdayStr,
				period: DATERANGE_PERIOD.DAY,
				shortcutId: 'last_7_days',
			},
			{
				id: 'last_30_days',
				label: translateFunction( 'Last 30 Days' ),
				startDate: siteYesterday.clone().subtract( 29, 'days' ).format( DATE_FORMAT ),
				endDate: yesterdayStr,
				period: DATERANGE_PERIOD.DAY,
				shortcutId: 'last_30_days',
			},
			{
				id: 'last_3_months',
				label: translateFunction( 'Last 90 Days' ),
				startDate: siteYesterday.clone().subtract( 89, 'days' ).format( DATE_FORMAT ),
				endDate: yesterdayStr,
				period: DATERANGE_PERIOD.WEEK,
				shortcutId: 'last_3_months',
			},
			{
				id: 'last_year',
				label: translateFunction( 'Last Year' ),
				startDate: siteYesterday.clone().subtract( 364, 'days' ).format( DATE_FORMAT ),
				endDate: yesterdayStr,
				period: DATERANGE_PERIOD.MONTH,
				shortcutId: 'last_year',
			},
			{
				id: 'custom_date_range',
				label: translateFunction( 'Custom Range' ),
				startDate: '',
				endDate: '',
				period: DATERANGE_PERIOD.DAY,
				shortcutId: 'custom_date_range',
			},
		];

		if ( isNewDateFilteringEnabled ) {
			supportedShortcutList.unshift(
				{
					id: 'today',
					label: translateFunction( 'Today' ),
					startDate: siteTodayStr,
					endDate: siteTodayStr,
					period: DATERANGE_PERIOD.DAY,
					shortcutId: 'today',
				},
				{
					id: 'yesterday',
					label: translateFunction( 'Yesterday' ),
					startDate: yesterdayStr,
					endDate: yesterdayStr,
					period: DATERANGE_PERIOD.DAY,
					shortcutId: 'yesterday',
				}
			);
		}

		const findShortcutForRange = (
			supportedShortcutList: DateRangePickerShortcut[],
			dateRange: { chartStart: string; chartEnd: string }
		) => {
			if ( ! dateRange?.chartEnd || ! dateRange?.chartStart ) {
				return null;
			}
			// Search the shortcut array for something matching the current date range.
			// Returns shortcut or null;
			const shortcut = supportedShortcutList.find( ( element ) => {
				if (
					element.endDate === dateRange.chartEnd &&
					element.startDate === dateRange.chartStart
				) {
					return element;
				}
				return null;
			} );

			return shortcut;
		};

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
		},
		translateFunction,
		isNewDateFilteringEnabled
	) => {
		const siteId = getSelectedSiteId( state );
		const siteToday = getMomentSiteZone( state, siteId );

		return [
			siteId,
			siteToday.format( DATE_FORMAT ),
			dateRange?.chartStart,
			dateRange?.chartEnd,
			isNewDateFilteringEnabled,
		];
	}
);

export function useShortcuts(
	dateRange: { chartStart: string; chartEnd: string; daysInRange: number },
	isNewDateFilteringEnabled = false
) {
	const translate = useTranslate();
	const shortcuts = useSelector( ( state ) =>
		getShortcuts( state, dateRange, translate, isNewDateFilteringEnabled )
	);

	return shortcuts;
}
