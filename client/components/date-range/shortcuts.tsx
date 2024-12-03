import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import moment, { Moment } from 'moment';
import PropTypes from 'prop-types';
import { DATE_FORMAT } from 'calypso/my-sites/stats/constants';
import { useShortcuts } from './use-shortcuts';

type MomentOrNull = Moment | null;

export interface DateRangePickerShortcut {
	id: string;
	label: string;
	startDate: string;
	endDate: string;
	period: string;
	statType?: string;
	isGated?: boolean;
	shortcutId?: string;
}

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
	const normalizeDate = ( date: MomentOrNull ) => {
		return date ? date.startOf( 'day' ) : date;
	};

	// Normalize dates to start of day
	const normalizedStartDate = startDate ? normalizeDate( startDate ) : null;
	const normalizedEndDate = endDate ? normalizeDate( endDate ) : null;

	const { supportedShortcutList: shortcutList, selectedShortcut } = useShortcuts(
		{
			chartStart: normalizedStartDate?.format( DATE_FORMAT ) ?? '',
			chartEnd: normalizedEndDate?.format( DATE_FORMAT ) ?? '',
			daysInRange: ( normalizedEndDate?.diff( normalizedStartDate, 'days' ) ?? 0 ) + 1,
		},
		isNewDateFilteringEnabled
	);

	const handleClick = ( { id, startDate, endDate }: Partial< DateRangePickerShortcut > ) => {
		onClick( moment( startDate ), moment( endDate ), id || '' );

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
