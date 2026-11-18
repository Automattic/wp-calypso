import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { Icon, check, chevronDown, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, MouseEventHandler } from 'react';
import {
	DATE_RANGES,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_30_DAYS,
	DATE_RANGE_LAST_90_DAYS,
	DATE_RANGE_LAST_12_MONTHS,
	DateRangeId,
} from '../lib/date-ranges';
import { recordWidgetEventThenFollow } from './record-widget-event';

import './date-range-control.scss';

interface DateRangeControlProps {
	value: DateRangeId;
	onChange: ( value: DateRangeId ) => void;
	/** Whether the site's plan locks a range, as Stats v2 locks its date shortcuts. */
	isLocked?: ( value: DateRangeId ) => boolean;
	upgradeUrl?: string;
}

/**
 * The widget's date range picker, after Premium Analytics' `DateComparisonDropdown` (jetpack
 * `premium-analytics/packages/ui/src/date-comparison-dropdown`), rather than a `SelectControl`,
 * whose options open in the browser's native menu.
 */
const DateRangeControl: FunctionComponent< DateRangeControlProps > = ( {
	value,
	onChange,
	isLocked = () => false,
	upgradeUrl,
} ) => {
	const translate = useTranslate();

	// Kept next to the control rather than in `lib/date-ranges` so the strings stay
	// where the string extractor looks.
	const labels: Record< DateRangeId, string > = {
		[ DATE_RANGE_LAST_7_DAYS ]: translate( 'Last 7 days' ),
		[ DATE_RANGE_LAST_30_DAYS ]: translate( 'Last 30 days' ),
		[ DATE_RANGE_LAST_90_DAYS ]: translate( 'Last 90 days' ),
		[ DATE_RANGE_LAST_12_MONTHS ]: translate( 'Last 12 months' ),
	};

	const hasLockedRanges = DATE_RANGES.some( ( range ) => isLocked( range.id ) );

	return (
		<DropdownMenu
			className="stats-widget-date-range"
			icon={ chevronDown }
			text={ labels[ value ] }
			// Includes the visible text, so speech control can act on what it reads.
			label={
				translate( 'Date range: %(range)s', {
					args: { range: labels[ value ] },
				} ) as string
			}
			popoverProps={ { placement: 'bottom-end', className: 'stats-widget-date-range__popover' } }
			toggleProps={ {
				className: 'stats-widget-date-range__toggle',
				iconPosition: 'right',
				iconSize: 18,
				// The visible text already names the choice; a tooltip would repeat it.
				showTooltip: false,
			} }
		>
			{ ( { onClose } ) => (
				<>
					<MenuGroup>
						{ DATE_RANGES.map( ( range ) => {
							const isSelected = range.id === value;
							const isRangeLocked = isLocked( range.id );

							return (
								<MenuItem
									key={ range.id }
									role="menuitemradio"
									isSelected={ isSelected }
									icon={ isSelected ? check : undefined }
									disabled={ isRangeLocked }
									suffix={ isRangeLocked ? <Icon icon={ lock } size={ 18 } /> : undefined }
									onClick={ () => {
										onChange( range.id );
										onClose();
									} }
								>
									{ labels[ range.id ] }
								</MenuItem>
							);
						} ) }
					</MenuGroup>
					{ hasLockedRanges && upgradeUrl && (
						<MenuGroup>
							<MenuItem
								href={ upgradeUrl }
								info={ translate( 'Upgrade your plan to see your stats over longer periods.' ) }
								// `MenuItem` renders an `<a>` when given `href`, but types its events as a button's.
								onClick={
									recordWidgetEventThenFollow( 'upgrade_clicked', {
										feature: 'date_range',
									} ) as MouseEventHandler< HTMLElement >
								}
							>
								{ translate( 'Upgrade' ) }
							</MenuItem>
						</MenuGroup>
					) }
				</>
			) }
		</DropdownMenu>
	);
};

export default DateRangeControl;
