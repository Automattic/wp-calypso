import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { check, chevronDown } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import {
	DATE_RANGES,
	DATE_RANGE_LAST_7_DAYS,
	DATE_RANGE_LAST_30_DAYS,
	DATE_RANGE_LAST_12_MONTHS,
	DateRangeId,
} from '../lib/date-ranges';

import './date-range-control.scss';

interface DateRangeControlProps {
	value: DateRangeId;
	onChange: ( value: DateRangeId ) => void;
}

/**
 * The widget's date range picker.
 *
 * Follows Premium Analytics' `DateComparisonDropdown` (jetpack
 * `premium-analytics/packages/ui/src/date-comparison-dropdown`): a `DropdownMenu` whose
 * trigger shows the current range with a chevron, opening radio items with a check on the
 * selected one. A menu rather than `SelectControl`, whose options open in the browser's
 * native popup — on macOS a system menu that matches nothing else in wp-admin.
 */
const DateRangeControl: FunctionComponent< DateRangeControlProps > = ( { value, onChange } ) => {
	const translate = useTranslate();

	// Kept next to the control rather than in `lib/date-ranges` so the strings stay
	// where the string extractor looks.
	const labels: Record< DateRangeId, string > = {
		[ DATE_RANGE_LAST_7_DAYS ]: translate( 'Last 7 days' ),
		[ DATE_RANGE_LAST_30_DAYS ]: translate( 'Last 30 days' ),
		[ DATE_RANGE_LAST_12_MONTHS ]: translate( 'Last 12 months' ),
	};

	return (
		<DropdownMenu
			className="stats-widget-date-range"
			icon={ chevronDown }
			text={ labels[ value ] }
			label={ translate( 'Date range' ) }
			// The control sits at the header's right edge, so the menu lines up with it.
			popoverProps={ { placement: 'bottom-end' } }
			toggleProps={ {
				className: 'stats-widget-date-range__toggle',
				iconPosition: 'right',
				iconSize: 18,
				// The visible text already names the choice; a tooltip would repeat it.
				showTooltip: false,
			} }
		>
			{ ( { onClose } ) => (
				<MenuGroup>
					{ DATE_RANGES.map( ( range ) => {
						const isSelected = range.id === value;

						return (
							<MenuItem
								key={ range.id }
								role="menuitemradio"
								isSelected={ isSelected }
								icon={ isSelected ? check : undefined }
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
			) }
		</DropdownMenu>
	);
};

export default DateRangeControl;
