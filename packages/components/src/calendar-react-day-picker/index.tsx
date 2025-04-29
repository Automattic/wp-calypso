import clsx from 'clsx';
import { useTranslate, useRtl } from 'i18n-calypso';
import { useMemo } from 'react';
import {
	DayPicker,
	type PropsBase,
	type PropsSingle,
	type PropsSingleRequired,
	type PropsRange,
	type PropsRangeRequired,
	Modifiers,
	// getDefaultClassNames,
} from 'react-day-picker';

import './styles.scss';

// const CustomMonthCaption = ( { calendarMonth, displayIndex, ...props }: MonthCaptionProps ) => {
// 	return (
// 		<div
// 			{ ...props }
// 			style={ {
// 				...props.style,
// 				// display: 'flex',
// 				// alignItems: 'center',
// 				// justifyContent: 'center',
// 				// height: 'var(--rdp-nav-height)',
// 			} }
// 		>
// 			{ format( calendarMonth.date, 'MMMM yyyy' ) }
// 		</div>
// 	);
// };

type DateCalendarProps = PropsBase & ( PropsSingle | PropsSingleRequired );
type DateRangeCalendarProps = PropsBase & ( PropsRange | PropsRangeRequired );

// Known RTL base locale codes
const rtlLocales = [ 'ar', 'he', 'fa', 'ur', 'ps', 'syr', 'dv', 'ku', 'ug', 'yi' ];

function isDateFnsLocaleRTL( dateFnsLocale?: PropsBase[ 'locale' ] ) {
	return isLocaleRTL( dateFnsLocale?.code );
}

function isLocaleRTL( code?: string ) {
	if ( ! code ) {
		return false;
	}
	const baseCode = code.split( '-' )[ 0 ]; // e.g., 'ar' from 'ar-SA'
	return rtlLocales.includes( baseCode );
}

const useCommonProps = ( {
	numberOfMonths,
	locale,
}: {
	numberOfMonths: number;
	locale: PropsBase[ 'locale' ];
} ) => {
	const translate = useTranslate();
	const isCalypsoRtl = useRtl();

	const commonProps = useMemo( () => {
		const isRtl = isDateFnsLocaleRTL( locale ) ?? isCalypsoRtl;
		const localeCode = locale?.code ?? translate.localeSlug ?? 'en-US';

		// ie. April 2025
		const monthNameFormatter = new Intl.DateTimeFormat( localeCode, {
			year: 'numeric',
			month: 'long',
		} );
		// ie. M, T, W, T, F, S, S
		const weekdayNarrowFormatter = new Intl.DateTimeFormat( localeCode, {
			weekday: 'narrow',
		} );
		const weekdayLongFormatter = new Intl.DateTimeFormat( localeCode, {
			weekday: 'long',
		} );
		// ie. Monday, April 29, 2025
		const fullDateFormatter = new Intl.DateTimeFormat( localeCode, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		} );

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
			// Hide navigation buttons
			hideNavigation: false,
			// Show multiple months (1, 2, 3)
			numberOfMonths: Math.min( 3, Math.max( 1, numberOfMonths ) ),
			// Localization
			locale,
			formatters: {
				formatWeekdayName: ( date: Date ) => {
					return weekdayNarrowFormatter.format( date );
				},
				formatCaption: ( date: Date ) => {
					return monthNameFormatter.format( date );
				},
			},
			labels: {
				/** The label for the month grid. */
				labelGrid: ( date: Date ) => monthNameFormatter.format( date ),
				/** The label for the gridcell, when the calendar is not interactive. */
				labelGridcell: (
					date: Date,
					/** The modifiers for the day. */
					modifiers?: Modifiers
				) => {
					const formattedDate = fullDateFormatter.format( date );
					let label = formattedDate;
					if ( modifiers?.today ) {
						label = translate( 'Today, %(fullDate)s', {
							args: { fullDate: formattedDate },
						} ) as string;
					}
					return label;
				},
				/** The label for the "next month" button. */
				labelNext: () => translate( 'Go to the Next Month' ),
				/** The label for the "previous month" button. */
				labelPrevious: () => translate( 'Go to the Previous Month' ),
				/** The label for the day button. */
				labelDayButton: (
					date: Date,
					/** The modifiers for the day. */
					modifiers?: Modifiers
				) => {
					const formattedDate = fullDateFormatter.format( date );
					let label = formattedDate;
					if ( modifiers?.today ) {
						label = translate( 'Today, %(fullDate)s', {
							args: { fullDate: formattedDate },
						} ) as string;
					}
					if ( modifiers?.selected ) {
						label = translate( '%(fullDate)s, selected', {
							args: { fullDate: formattedDate },
						} ) as string;
					}
					return label;
				},
				/** The label for the weekday. */
				labelWeekday: ( date: Date ) => weekdayLongFormatter.format( date ),
			},
			dir: isRtl ? 'rtl' : 'ltr',
		} as const;
	}, [ numberOfMonths, locale, isCalypsoRtl, translate ] );

	return commonProps;
};

export const DateCalendar = ( {
	className,
	numberOfMonths = 1,
	// Start week on Monday
	// Is this a good default? Should we expose it individually? Should it be part of localization?
	weekStartsOn = 1,
	[ 'aria-label' ]: ariaLabel = 'Date calendar',
	locale,
	...props
}: DateCalendarProps ) => {
	// const defaultClassNames = getDefaultClassNames();
	const commonProps = useCommonProps( { numberOfMonths, locale } );

	return (
		<DayPicker
			weekStartsOn={ weekStartsOn }
			aria-label={ ariaLabel }
			className={ clsx( 'a8c-components-date-calendar', className ) }
			{ ...props }
			mode="single"
			// TODO: add custom classnames everywhere, potentially
			// replace style overrides
			// classNames={ {
			// 	selected: `${ defaultClassNames.selected } marco`,
			// 	day_button: `${ defaultClassNames.day_button } marco`,
			// } }
			{ ...commonProps }
		/>
	);
};

export const DateRangeCalendar = ( {
	className,
	numberOfMonths = 1,
	// Start week on Monday
	// Is this a good default? Should we expose it individually? Should it be part of localization?
	weekStartsOn = 1,
	[ 'aria-label' ]: ariaLabel = 'Date range calendar',
	locale,
	...props
}: DateRangeCalendarProps ) => {
	const commonProps = useCommonProps( { numberOfMonths, locale } );

	return (
		<DayPicker
			weekStartsOn={ weekStartsOn }
			aria-label={ ariaLabel }
			className={ clsx( 'a8c-components-date-range-calendar', className ) }
			{ ...props }
			mode="range"
			excludeDisabled
			// TODO: add custom classnames everywhere, potentially
			// replace style overrides
			// classNames={ {
			// 	selected: `${ defaultClassNames.selected } marco`,
			// 	day_button: `${ defaultClassNames.day_button } marco`,
			// } }
			{ ...commonProps }
		/>
	);
};
