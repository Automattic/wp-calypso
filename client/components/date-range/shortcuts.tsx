import { Button } from '@wordpress/components';
import { Icon, check, lock } from '@wordpress/icons';
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
}

const DateRangePickerShortcuts = ( {
	currentShortcut,
	onClick,
	onShortcutClick, // Optional callback function for tracking shortcut clicks
	locked = false,
	startDate,
	endDate,
	shortcutList,
	// Temporary prop to enable new date filtering UI.
	isNewDateFilteringEnabled = false,
}: {
	currentShortcut?: string;
	onClick: ( newFromDate: moment.Moment, newToDate: moment.Moment ) => void;
	onShortcutClick?: ( shortcut: DateRangePickerShortcut ) => void;
	locked?: boolean;
	startDate?: MomentOrNull;
	endDate?: MomentOrNull;
	shortcutList?: DateRangePickerShortcut[];
	isNewDateFilteringEnabled?: boolean;
} ) => {
	const normalizeDate = ( date: MomentOrNull ) => {
		return date ? date.startOf( 'day' ) : date;
	};

	// Normalize dates to start of day
	const normalizedStartDate = startDate ? normalizeDate( startDate ) : null;
	const normalizedEndDate = endDate ? normalizeDate( endDate ) : null;

	const { supportedShortcutList: defaultShortcutList, selectedShortcut } = useShortcuts(
		{
			chartStart: normalizedStartDate?.format( DATE_FORMAT ) ?? '',
			chartEnd: normalizedEndDate?.format( DATE_FORMAT ) ?? '',
			daysInRange: ( normalizedEndDate?.diff( normalizedStartDate, 'days' ) ?? 0 ) + 1,
		},
		isNewDateFilteringEnabled
	);

	shortcutList = shortcutList || defaultShortcutList;

	const handleClick = ( shortcut: DateRangePickerShortcut ) => {
		! locked &&
			shortcut.startDate &&
			shortcut.endDate &&
			onClick( moment( shortcut.startDate ), moment( shortcut.endDate ) );

		// Call the onShortcutClick if provided
		onShortcutClick && onShortcutClick( shortcut );
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
						<Button onClick={ () => handleClick( shortcut ) }>
							<span>{ shortcut.label }</span>
							{ shortcut.id === currentShortcut && <Icon icon={ check } /> }
							{ shortcut.isGated && <Icon icon={ lock } /> }
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
