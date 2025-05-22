import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { enUS } from 'react-day-picker/locale';
import { COMMON_PROPS, MODIFIER_CLASSNAMES } from './utils/constants';
import { clampNumberOfMonths } from './utils/misc';
import { useControlledValue } from './utils/use-controlled-value';
import { useLocalizationProps } from './utils/use-localization-props';
import type { DateRangeCalendarProps, DateRange, OnSelectHandler } from './types';
import './styles.scss';

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
		onChange: onSelect as OnSelectHandler< DateRange | undefined >,
	} );

	const [ hoveredDate, setHoveredDate ] = useState< Date | undefined >( undefined );
	// Compute the preview range for hover effect
	const previewRange = useMemo( () => {
		// Range preview is disabled when:
		// - min, max, excludeDisabled props are used (as the logic to handle
		//   these cases is complex and hasn't been implemented yet);
		// - or when there is no hovered date or selected range.
		if (
			min !== undefined ||
			max !== undefined ||
			excludeDisabled ||
			! hoveredDate ||
			! selected?.from
		) {
			return;
		}

		// Hovering on a date before the start of the selected range
		if ( hoveredDate < selected.from ) {
			return {
				from: hoveredDate,
				to: selected.from,
			};
		}

		// Hovering on a date between the start and end of the selected range
		if ( selected.to && hoveredDate > selected.from && hoveredDate < selected.to ) {
			return {
				from: selected.from,
				to: hoveredDate,
			};
		}

		// Hovering on a date after the end of the selected range (either
		// because it's greater than selected.to, or because it's not defined)
		if ( hoveredDate > selected.from ) {
			return {
				from: selected.to,
				to: hoveredDate,
			};
		}
	}, [ selected, hoveredDate, excludeDisabled, min, max ] );

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
