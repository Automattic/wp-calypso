import { differenceInCalendarDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { DayPicker, rangeContainsModifiers } from 'react-day-picker';
import { enUS } from 'react-day-picker/locale';
import { COMMON_PROPS, MODIFIER_CLASSNAMES } from '../utils/constants';
import { clampNumberOfMonths } from '../utils/misc';
import { useControlledValue } from '../utils/use-controlled-value';
import { useLocalizationProps } from '../utils/use-localization-props';
import type { DateRangeCalendarProps, DateRange } from '../types';

export function usePreviewRange( {
	selected,
	hoveredDate,
	excludeDisabled,
	min,
	max,
	disabled,
}: Pick< DateRangeCalendarProps, 'selected' | 'excludeDisabled' | 'min' | 'max' | 'disabled' > & {
	hoveredDate: Date | undefined;
} ) {
	return useMemo( () => {
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
			min > 0 &&
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
			max > 0 &&
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
			disabled &&
			potentialNewRange &&
			rangeContainsModifiers( potentialNewRange, disabled )
		) {
			previewHighlight = {
				from: hoveredDate,
				to: hoveredDate,
			};
		}

		return previewHighlight;
	}, [ selected, hoveredDate, excludeDisabled, min, max, disabled ] );
}

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
	disabled,
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
	const previewRange = usePreviewRange( {
		selected,
		hoveredDate,
		excludeDisabled,
		min,
		max,
		disabled,
	} );

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
			disabled={ disabled }
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
