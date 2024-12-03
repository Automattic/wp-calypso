import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import moment, { Moment } from 'moment';
import PropTypes from 'prop-types';
import useMomentSiteZone from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import { useShortcuts } from './use-shortcuts';

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
	const siteToday = useMomentSiteZone();

	const normalizeDate = ( date: MomentOrNull ) => {
		return date ? date.startOf( 'day' ) : date;
	};

	// Normalize dates to start of day
	const normalizedStartDate = startDate ? normalizeDate( startDate ) : null;
	const normalizedEndDate = endDate ? normalizeDate( endDate ) : null;

	const { supportedShortcutList: shortcutList, selectedShortcut } = useShortcuts(
		{
			chartStart: normalizedStartDate?.format( 'YYYY-MM-DD' ) ?? '',
			chartEnd: normalizedEndDate?.format( 'YYYY-MM-DD' ) ?? '',
			daysInRange: ( normalizedEndDate?.diff( normalizedStartDate, 'days' ) ?? 0 ) + 1,
		},
		undefined,
		isNewDateFilteringEnabled
	);

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

	currentShortcut = currentShortcut || selectedShortcut?.id || 'custom_date_range';

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
