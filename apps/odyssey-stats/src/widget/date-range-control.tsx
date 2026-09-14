import { SelectControl } from '@wordpress/components';
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
 * Matches how Jetpack builds filter selects elsewhere — see the product filter in
 * `my-jetpack/_inc/components/my-jetpack-tab-panel/products/filters.tsx`:
 * `SelectControl` with the 40px size and no bottom margin, named by `aria-label`.
 */
const DateRangeControl: FunctionComponent< DateRangeControlProps > = ( { value, onChange } ) => {
	const translate = useTranslate();

	// Kept next to the control rather than in `lib/date-ranges` so the strings stay
	// where the string extractor looks, and so the heading labels in Highlights can
	// word the same range differently.
	const labels: Record< DateRangeId, string > = {
		[ DATE_RANGE_LAST_7_DAYS ]: translate( 'Last 7 days' ),
		[ DATE_RANGE_LAST_30_DAYS ]: translate( 'Last 30 days' ),
		[ DATE_RANGE_LAST_12_MONTHS ]: translate( 'Last 12 months' ),
	};

	return (
		<div className="stats-widget-date-range">
			<SelectControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				aria-label={ translate( 'Date range' ) }
				value={ value }
				options={ DATE_RANGES.map( ( range ) => ( {
					label: labels[ range.id ],
					value: range.id,
				} ) ) }
				onChange={ ( newValue: string ) => onChange( newValue as DateRangeId ) }
			/>
		</div>
	);
};

export default DateRangeControl;
