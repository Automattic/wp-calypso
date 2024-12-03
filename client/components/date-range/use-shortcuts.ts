import config from '@automattic/calypso-config';
import { translate, useTranslate } from 'i18n-calypso';
import { getMomentSiteZone } from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { DateControlPickerShortcut } from '../date-control/types';

export const DATERANGE_PERIOD = {
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
};

export function getShortcuts(
	state: object,
	dateRange: {
		chartStart: string;
		chartEnd: string;
		daysInRange: number;
	},
	shortcutList?: string[],
	translateFunction = translate,
	isNewDateFilteringEnabled = config.isEnabled( 'stats/new-date-filtering' )
) {
	const siteId = getSelectedSiteId( state );
	const siteToday = getMomentSiteZone( state, siteId );

	const supportedShortcutList: DateControlPickerShortcut[] = [
		{
			id: 'last_7_days',
			label: translateFunction( 'Last 7 Days' ),
			offset: 0,
			range: 6,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'last_7_days',
		},
		{
			id: 'last_30_days',
			label: translateFunction( 'Last 30 Days' ),
			offset: 0,
			range: 29,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'last_30_days',
		},
		{
			id: 'last_3_months',
			label: translateFunction( 'Last 90 Days' ),
			offset: 0,
			range: 89,
			period: DATERANGE_PERIOD.WEEK,
			shortcutId: 'last_3_months',
		},
		{
			id: 'last_year',
			label: translateFunction( 'Last Year' ),
			offset: 0,
			range: 364, // ranges are zero based!
			period: DATERANGE_PERIOD.MONTH,
			shortcutId: 'last_year',
		},
		{
			id: 'custom_date_range',
			label: translateFunction( 'Custom Range' ),
			offset: 0,
			range: 0,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'custom_date_range',
		},
	];

	if ( isNewDateFilteringEnabled ) {
		supportedShortcutList.unshift(
			{
				id: 'today',
				label: translateFunction( 'Today' ),
				offset: 0,
				range: 0,
				period: DATERANGE_PERIOD.DAY,
				shortcutId: 'today',
			},
			{
				id: 'yesterday',
				label: translateFunction( 'Yesterday' ),
				offset: 1,
				range: 0,
				period: DATERANGE_PERIOD.DAY,
				shortcutId: 'yesterday',
			}
		);
	}

	const getShortcutForRange = () => {
		if ( ! dateRange?.chartEnd || ! dateRange?.chartStart ) {
			return null;
		}
		// Search the shortcut array for something matching the current date range.
		// Returns shortcut or null;
		const today = siteToday.format( 'YYYY-MM-DD' );
		const yesterday = siteToday.clone().subtract( 1, 'days' ).format( 'YYYY-MM-DD' );
		const shortcut = supportedShortcutList.find( ( element ) => {
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

	return {
		selectedShortcut: getShortcutForRange(),
		supportedShortcutList,
	};
}

export function useShortcuts(
	dateRange: { chartStart: string; chartEnd: string; daysInRange: number },
	shortcutList?: string[],
	isNewDateFilteringEnabled = false
) {
	const translate = useTranslate();
	const shortcuts = useSelector( ( state ) =>
		getShortcuts( state, dateRange, shortcutList, translate, isNewDateFilteringEnabled )
	);

	return shortcuts;
}
