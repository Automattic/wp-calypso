import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment, { Moment } from 'moment';
import PropTypes from 'prop-types';
import useMomentSiteZone from 'calypso/my-sites/stats/hooks/use-moment-site-zone';

const DATERANGE_PERIOD = {
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
};

type MomentOrNull = Moment | null;

const DateRangePickerShortcuts = ( {
	currentShortcut,
	onClick,
	onShortcutClick, // Optional callback function for tracking shortcut clicks
	locked = false,
	startDate,
	endDate,
	// Temporary prop to enable new date filtering UI.
	isNewDateFilteringEnabled = false,
}: {
	currentShortcut?: string;
	onClick: ( newFromDate: moment.Moment, newToDate: moment.Moment, shortcutId: string ) => void;
	onShortcutClick?: ( shortcutId: string ) => void;
	locked?: boolean;
	startDate?: MomentOrNull;
	endDate?: MomentOrNull;
	isNewDateFilteringEnabled?: boolean;
} ) => {
	const translate = useTranslate();
	const siteToday = useMomentSiteZone();

	const normalizeDate = ( date: MomentOrNull ) => {
		return date ? date.startOf( 'day' ) : date;
	};

	// Normalize dates to start of day
	const normalizedStartDate = startDate ? normalizeDate( startDate ) : null;
	const normalizedEndDate = endDate ? normalizeDate( endDate ) : null;

	// TODO: Receive this list from the parent component.
	const shortcutList = [
		{
			id: 'last_7_days',
			label: translate( 'Last 7 Days' ),
			offset: 0,
			range: 6,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'last_7_days',
		},
		{
			id: 'last_30_days',
			label: translate( 'Last 30 Days' ),
			offset: 0,
			range: 29,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'last_30_days',
		},
		{
			id: 'last_3_months',
			label: translate( 'Last 90 Days' ),
			offset: 0,
			range: 89,
			period: DATERANGE_PERIOD.WEEK,
			shortcutId: 'last_3_months',
		},
		{
			id: 'last_year',
			label: translate( 'Last Year' ),
			offset: 0,
			range: 364, // ranges are zero based!
			period: DATERANGE_PERIOD.MONTH,
			shortcutId: 'last_year',
		},
		{
			id: 'custom_date_range',
			label: translate( 'Custom Range' ),
			offset: 0,
			range: 0,
			period: DATERANGE_PERIOD.DAY,
			shortcutId: 'custom_date_range',
		},
	];

	if ( isNewDateFilteringEnabled ) {
		shortcutList.unshift(
			{
				id: 'today',
				label: translate( 'Today' ),
				offset: 0,
				range: 0,
				period: DATERANGE_PERIOD.DAY,
				shortcutId: 'today',
			},
			{
				id: 'yesterday',
				label: translate( 'Yesterday' ),
				offset: 1,
				range: 0,
				period: DATERANGE_PERIOD.DAY,
				shortcutId: 'yesterday',
			}
		);
	}

	const getShortcutForRange = ( startDate: MomentOrNull, endDate: MomentOrNull ) => {
		if ( ! startDate || ! endDate ) {
			return null;
		}
		// Search the shortcut array for something matching the current date range.
		// Returns shortcut or null;
		const today = siteToday.clone().startOf( 'day' );
		const daysInRange = Math.abs( endDate.diff( startDate, 'days' ) );
		const shortcut = shortcutList.find( ( element ) => {
			if (
				( endDate.isSame( today, 'day' ) || element.offset === 1 ) &&
				daysInRange === element.range
			) {
				return element;
			}
			return null;
		} );
		return shortcut;
	};

	const handleClick = ( { id, offset, range }: { id?: string; offset: number; range: number } ) => {
		const newToDate = siteToday.clone().startOf( 'day' ).subtract( offset, 'days' );
		const newFromDate = siteToday
			.clone()
			.startOf( 'day' )
			.subtract( offset + range, 'days' );
		onClick( newFromDate, newToDate, id || '' );

		// Call the onShortcutClick if provided
		if ( onShortcutClick && id ) {
			onShortcutClick( id );
		}
	};

	currentShortcut =
		currentShortcut ||
		getShortcutForRange( normalizedStartDate, normalizedEndDate )?.id ||
		'custom_date_range';

	return (
		<div className="date-range-picker-shortcuts__inner">
			<ul className="date-range-picker-shortcuts__list">
				{ shortcutList.map( ( shortcut, idx ) => (
					<li
						className={ clsx( 'date-range-picker-shortcuts__shortcut', {
							'is-selected': shortcut.id === currentShortcut,
						} ) }
						key={ shortcut.id || idx }
					>
						<Button onClick={ () => ! locked && handleClick( shortcut ) }>
							<span>{ shortcut.label }</span>
							{ shortcut.id === currentShortcut && <Icon icon={ check } /> }
						</Button>
					</li>
				) ) }
			</ul>
		</div>
	);
};

DateRangePickerShortcuts.propTypes = {
	currentShortcut: PropTypes.string,
	onClick: PropTypes.func.isRequired,
	onShortcutClick: PropTypes.func,
	locked: PropTypes.bool,
	startDate: PropTypes.object,
	endDate: PropTypes.object,
};

export default DateRangePickerShortcuts;
