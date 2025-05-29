import { differenceInCalendarDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { DayPicker, rangeContainsModifiers } from 'react-day-picker';
import { enUS } from 'react-day-picker/locale';
import { COMMON_PROPS, MODIFIER_CLASSNAMES } from '../utils/constants';
import { clampNumberOfMonths } from '../utils/misc';
import { useControlledValue } from '../utils/use-controlled-value';
import { useLocalizationProps } from '../utils/use-localization-props';
import type { DateRangeCalendarProps, DateRange } from '../types';

/**
 * `DateRangeCalendar` is a React component that provides a customizable calendar
 * interface for **date range** selection.
 *
 * The component is built with accessibility in mind and follows ARIA best
 * practices for calendar widgets. It provides keyboard navigation, screen reader
 * support, and customizable labels for internationalization.
 */
export const DateRangeCalendar = ( {
	defaultSelected,
	selected: selectedProp,
	onSelect,
	numberOfMonths = 1,
	excludeDisabled,
	min,
	max,
	locale = enUS,
	timeZone,
	...props
}: DateRangeCalendarProps ) => {
	const localizationProps = useLocalizationProps( { locale, timeZone, mode: 'range' } );

	const [ selected, setSelected ] = useControlledValue< DateRange | undefined >( {
		defaultValue: defaultSelected,
		value: selectedProp,
		onChange: onSelect,
	} );

	const [ hoveredDate, setHoveredDate ] = useState< Date | undefined >( undefined );
	// Compute the preview range for hover effect
	const previewRange = useMemo( () => {
		// Range preview is disabled when:
		// - min, max, excludeDisabled props are used (as the logic to handle
		//   these cases is complex and hasn't been implemented yet);
		// - or when there is no hovered date or selected range.
		if ( ! hoveredDate || ! selected?.from ) {
			return;
		}

		let previewHighlight: DateRange | undefined;
		let potentialNewRange: { from: Date; to: Date } | undefined;

		// Hovering on a date before the start of the selected range
		if ( hoveredDate < selected.from ) {
			previewHighlight = {
				from: hoveredDate,
				to: selected.from,
			};

			potentialNewRange = {
				from: hoveredDate,
				to: selected.to ?? selected.from,
			};
		} else if ( selected.to && hoveredDate > selected.from && hoveredDate < selected.to ) {
			// Hovering on a date between the start and end of the selected range
			previewHighlight = {
				from: selected.from,
				to: hoveredDate,
			};

			potentialNewRange = {
				from: selected.from,
				to: hoveredDate,
			};
		} else if ( hoveredDate > selected.from ) {
			// Hovering on a date after the end of the selected range (either
			// because it's greater than selected.to, or because it's not defined)
			previewHighlight = {
				from: selected.to ?? selected.from,
				to: hoveredDate,
			};

			potentialNewRange = {
				from: selected.from,
				to: hoveredDate,
			};
		}

		if (
			min !== undefined &&
			potentialNewRange &&
			differenceInCalendarDays( potentialNewRange.to, potentialNewRange.from ) < min
		) {
			previewHighlight = {
				from: hoveredDate,
				to: hoveredDate,
			};
		}

		if (
			max !== undefined &&
			potentialNewRange &&
			differenceInCalendarDays( potentialNewRange.to, potentialNewRange.from ) > max
		) {
			previewHighlight = {
				from: hoveredDate,
				to: hoveredDate,
			};
		}

		if (
			excludeDisabled &&
			props.disabled &&
			potentialNewRange &&
			rangeContainsModifiers( potentialNewRange, props.disabled )
		) {
			previewHighlight = {
				from: hoveredDate,
				to: hoveredDate,
			};
		}

		return previewHighlight;
	}, [ selected, hoveredDate, excludeDisabled, min, max, props.disabled ] );

	const modifiers = useMemo( () => {
		return {
			preview: previewRange,
			preview_start: previewRange?.from,
			preview_end: previewRange?.to,
		};
	}, [ previewRange ] );

	return (
		<DayPicker
			{ ...COMMON_PROPS }
			{ ...localizationProps }
			{ ...props }
			mode="range"
			numberOfMonths={ clampNumberOfMonths( numberOfMonths ) }
			excludeDisabled={ excludeDisabled }
			min={ min }
			max={ max }
			selected={ selected }
			onSelect={ setSelected }
			onDayMouseEnter={ ( date ) => setHoveredDate( date ) }
			onDayMouseLeave={ () => setHoveredDate( undefined ) }
			modifiers={ modifiers }
			modifiersClassNames={ MODIFIER_CLASSNAMES }
		/>
	);
};
