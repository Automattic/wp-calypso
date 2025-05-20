import { useMemo, useState } from 'react';
import { DayPicker, TZDate } from 'react-day-picker';
import { Day } from './day-cell';
import { useControlledValue } from './utils';
import type {
	DateCalendarProps,
	DateRangeCalendarProps,
	DateRange,
	OnSelectHandler,
} from './types';
import './styles.scss';

const BASE_CLASSNAME = 'a8c-components-calendar';
const CLASSNAMES = {
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
};
const MODIFIER_CLASSNAMES = {
	preview: `${ BASE_CLASSNAME }__day--preview`,
	preview_start: `${ BASE_CLASSNAME }__day--preview-start`,
	preview_end: `${ BASE_CLASSNAME }__day--preview-end`,
};

const COMMON_PROPS = {
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
	// Class names
	classNames: CLASSNAMES,
	// Default role
	role: 'application',
	components: {
		Day,
	},
} as const;

function clampNumberOfMonths( numberOfMonths: number ) {
	return Math.min( 3, Math.max( 1, numberOfMonths ) );
}

function isLocaleRTL( localeCode: string ) {
	return [
		'ar', // Arabic
		'he', // Hebrew
		'fa', // Persian (Farsi)
		'ur', // Urdu
		'ps', // Pashto
		'syr', // Syriac
		'dv', // Divehi
		'ku', // Kurdish (Sorani)
		'yi', // Yiddish
	].includes( localeCode.split( '-' )[ 0 ].toLowerCase() );
}

const useLocalizationProps = ( {
	dir,
	locale,
	timeZone,
}: {
	numberOfMonths: number;
	dir: DateCalendarProps[ 'dir' ];
	locale: DateCalendarProps[ 'locale' ];
	timeZone: DateCalendarProps[ 'timeZone' ];
} ) => {
	return useMemo( () => {
		const localeCode = locale?.code ?? 'en-US';

		return {
			// Localization
			locale,
			dir: dir ?? isLocaleRTL( localeCode ) ? 'rtl' : 'ltr',
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
		} as const;
	}, [ locale, timeZone, dir ] );
};

export const DateCalendar = ( {
	[ 'aria-label' ]: ariaLabel = 'Date calendar',
	dir,
	locale,
	numberOfMonths = 1,
	defaultSelected,
	selected: selectedProp,
	onSelect,
	timeZone,
	...props
}: DateCalendarProps ) => {
	const localizationProps = useLocalizationProps( { numberOfMonths, locale, timeZone, dir } );

	const [ selected, setSelected ] = useControlledValue< Date | undefined >( {
		defaultValue: defaultSelected,
		value: selectedProp,
		onChange: onSelect as OnSelectHandler< Date | undefined >,
	} );

	return (
		<DayPicker
			aria-label={ ariaLabel }
			{ ...COMMON_PROPS }
			{ ...props }
			{ ...localizationProps }
			mode="single"
			numberOfMonths={ clampNumberOfMonths( numberOfMonths ) }
			selected={ selected }
			onSelect={ setSelected }
		/>
	);
};

export const DateRangeCalendar = ( {
	[ 'aria-label' ]: ariaLabel = 'Date range calendar',
	locale,
	dir,
	numberOfMonths = 1,
	defaultSelected,
	selected: selectedProp,
	onSelect,
	timeZone,
	excludeDisabled,
	min,
	max,
	...props
}: DateRangeCalendarProps ) => {
	const localizationProps = useLocalizationProps( { numberOfMonths, locale, timeZone, dir } );

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
			aria-label={ ariaLabel }
			{ ...COMMON_PROPS }
			{ ...props }
			{ ...localizationProps }
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

export { TZDate };
