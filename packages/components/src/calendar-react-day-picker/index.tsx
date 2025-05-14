import { useMemo, useState, useCallback } from 'react';
import { DayPicker, TZDate } from 'react-day-picker';
import { useControlledValue } from './utils';
import type { DateCalendarProps, DateRangeCalendarProps, DateRange } from './types';

import './styles.scss';

const BASE_CLASSNAME = 'a8c-components-calendar';

const useCommonProps = ( {
	numberOfMonths,
	locale,
	timeZone,
}: {
	numberOfMonths: number;
	locale: DateCalendarProps[ 'locale' ];
	timeZone: DateCalendarProps[ 'timeZone' ];
} ) => {
	const commonProps = useMemo( () => {
		const localeCode = locale?.code ?? 'en-US';

		return {
			animate: true,
			// Only show days in the current month
			showOutsideDays: false,
			// Hide week number column
			showWeekNumber: false,
			// Show weekdays row
			hideWeekdays: false,
			// Month and year caption are not interactive
			captionLayout: 'label',
			// Show a variable number of weeks depending on the month
			fixedWeeks: false,
			// Show navigation buttons
			hideNavigation: false,
			// Show multiple months (1, 2, 3)
			numberOfMonths: Math.min( 3, Math.max( 1, numberOfMonths ) ),
			// Classname
			classNames: {
				root: BASE_CLASSNAME,
				day: `${ BASE_CLASSNAME }__day`,
				day_button: `${ BASE_CLASSNAME }__day-button`,
				caption_label: `${ BASE_CLASSNAME }__caption-label`,
				button_next: `${ BASE_CLASSNAME }__button-next`,
				button_previous: `${ BASE_CLASSNAME }__button-previous`,
				chevron: `${ BASE_CLASSNAME }__chevron`,
				nav: `${ BASE_CLASSNAME }__nav`,
				month_caption: `${ BASE_CLASSNAME }__month-caption`,
				months: `${ BASE_CLASSNAME }__months`,
				month_grid: `${ BASE_CLASSNAME }__month-grid`,
				weekday: `${ BASE_CLASSNAME }__weekday`,
				today: `${ BASE_CLASSNAME }__day--today`,
				selected: `${ BASE_CLASSNAME }__day--selected`,
				disabled: `${ BASE_CLASSNAME }__day--disabled`,
				hidden: `${ BASE_CLASSNAME }__day--hidden`,
				range_start: `${ BASE_CLASSNAME }__range-start`,
				range_end: `${ BASE_CLASSNAME }__range-end`,
				range_middle: `${ BASE_CLASSNAME }__range-middle`,
				weeks_before_enter: `${ BASE_CLASSNAME }__weeks-before-enter`,
				weeks_before_exit: `${ BASE_CLASSNAME }__weeks-before-exit`,
				weeks_after_enter: `${ BASE_CLASSNAME }__weeks-after-enter`,
				weeks_after_exit: `${ BASE_CLASSNAME }__weeks-after-exit`,
				caption_after_enter: `${ BASE_CLASSNAME }__caption-after-enter`,
				caption_after_exit: `${ BASE_CLASSNAME }__caption-after-exit`,
				caption_before_enter: `${ BASE_CLASSNAME }__caption-before-enter`,
				caption_before_exit: `${ BASE_CLASSNAME }__caption-before-exit`,
			},
			// Localization
			locale,
			formatters: {
				formatWeekdayName: ( date: Date ) => {
					// ie. M, T, W, T, F, S, S
					return new Intl.DateTimeFormat( localeCode, {
						weekday: 'narrow',
						timeZone,
					} ).format( date );
				},
				formatCaption: ( date: Date ) => {
					// ie. April 2025
					return new Intl.DateTimeFormat( localeCode, {
						year: 'numeric',
						month: 'long',
						timeZone,
					} ).format( date );
				},
			},
			timeZone,
			// a11y
			role: 'application',
		} as const;
	}, [ numberOfMonths, locale, timeZone ] );

	return commonProps;
};

export const DateCalendar = ( {
	[ 'aria-label' ]: ariaLabel = 'Date calendar',
	locale,
	numberOfMonths = 1,
	defaultSelected,
	selected: selectedProp,
	onSelect,
	timeZone,
	...props
}: DateCalendarProps ) => {
	const commonProps = useCommonProps( { numberOfMonths, locale, timeZone } );

	const [ selected, setSelected ] = useControlledValue< Date >( {
		defaultValue: defaultSelected,
		value: selectedProp,
		onChange: onSelect,
	} );

	return (
		<DayPicker
			aria-label={ ariaLabel }
			{ ...props }
			mode="single"
			selected={ selected }
			onSelect={ setSelected }
			{ ...commonProps }
		/>
	);
};

export const DateRangeCalendar = ( {
	[ 'aria-label' ]: ariaLabel = 'Date range calendar',
	locale,
	numberOfMonths = 1,
	defaultSelected,
	selected: selectedProp,
	onSelect,
	timeZone,
	...props
}: DateRangeCalendarProps ) => {
	const commonProps = useCommonProps( { numberOfMonths, locale, timeZone } );

	const [ selected, setSelected ] = useControlledValue< DateRange >( {
		defaultValue: defaultSelected,
		value: selectedProp,
		onChange: onSelect,
	} );

	const [ hoveredDate, setHoveredDate ] = useState< Date | undefined >( undefined );

	// Compute the preview range for hover effect
	const previewRange = useMemo( () => {
		if ( ! hoveredDate || ! selected?.from ) {
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
	}, [ selected, hoveredDate ] );

	const modifierProps = useMemo( () => {
		return {
			modifiers: {
				preview: previewRange,
				preview_start: previewRange?.from,
				preview_end: previewRange?.to,
			},
			modifiersClassNames: {
				preview: `${ BASE_CLASSNAME }__day--preview`,
				preview_start: `${ BASE_CLASSNAME }__day--preview-start`,
				preview_end: `${ BASE_CLASSNAME }__day--preview-end`,
			},
		};
	}, [ previewRange ] );

	const onDayMouseEnter = useCallback(
		( day: Date ) => {
			setHoveredDate( day );
		},
		[ setHoveredDate ]
	);

	const onDayMouseLeave = useCallback( () => {
		setHoveredDate( undefined );
	}, [ setHoveredDate ] );

	return (
		<DayPicker
			aria-label={ ariaLabel }
			{ ...props }
			mode="range"
			selected={ selected }
			onSelect={ setSelected }
			onDayMouseEnter={ onDayMouseEnter }
			onDayMouseLeave={ onDayMouseLeave }
			{ ...modifierProps }
			{ ...commonProps }
		/>
	);
};

export { TZDate };
