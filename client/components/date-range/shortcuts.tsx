import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import moment, { Moment } from 'moment';
import PropTypes from 'prop-types';

const DATERANGE_PERIOD = {
	DAY: 'day',
	WEEK: 'week',
	MONTH: 'month',
};

// Define the event name keys for tracking events
export type TypeShortcutId =
	| 'last_7_days'
	| 'last_30_days'
	| 'last_90_days'
	| 'last_year'
	| 'custom_date_range'
	| 'apply_button'
	| 'trigger_button';

type MomentOrNull = Moment | null;

const DateRangePickerShortcuts = ( {
	currentShortcut,
	onClick,
	onShortcutClick, // Optional callback function for tracking shortcut clicks
	locked = false,
	startDate,
	endDate,
}: {
	currentShortcut?: string;
	onClick: ( newFromDate: moment.Moment, newToDate: moment.Moment, shortcutId: string ) => void;
	onShortcutClick?: (
		shortcutId: TypeShortcutId,
		startDate?: Moment | null,
		endDate?: Moment | null
	) => void;
	locked?: boolean;
	startDate?: MomentOrNull;
	endDate?: MomentOrNull;
} ) => {
	const translate = useTranslate();

	const normalizeDate = ( date: MomentOrNull ) => {
		return date ? date.startOf( 'day' ) : date;
	};

	// Normalize dates to start of day
	const normalizedStartDate = startDate ? normalizeDate( startDate ) : null;
	const normalizedEndDate = endDate ? normalizeDate( endDate ) : null;

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

	const getShortcutForRange = ( startDate: MomentOrNull, endDate: MomentOrNull ) => {
		if ( ! startDate || ! endDate ) {
			return null;
		}
		// Search the shortcut array for something matching the current date range.
		// Returns shortcut or null;
		const today = moment().startOf( 'day' );
		const daysInRange = Math.abs( endDate.diff( startDate, 'days' ) );
		const shortcut = shortcutList.find( ( element ) => {
			if ( endDate.isSame( today ) && daysInRange === element.range ) {
				return element;
			}
			return null;
		} );
		return shortcut;
	};

	const handleClick = ( {
		id,
		offset,
		range,
	}: {
		id?: TypeShortcutId;
		offset: number;
		range: number;
	} ) => {
		const newToDate = moment().startOf( 'day' ).subtract( offset, 'days' );
		const newFromDate = moment()
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
