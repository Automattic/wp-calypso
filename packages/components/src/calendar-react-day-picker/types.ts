import type { Locale } from 'date-fns';
import type * as React from 'react';

/**
 * Represents the modifiers that match a specific day in the calendar.
 * @example
 *   const modifiers: Modifiers = {
 *   today: false, // the day is not today
 *   selected: true, // the day is selected
 *   disabled: false, // the day is not disabled
 *   outside: false, // the day is not outside the month
 *   focused: false, // the day is not focused
 *
 *   weekend: false // custom modifier example for matching a weekend
 *   booked: true // custom modifier example for matching a booked day
 *   available: false // custom modifier example for matching an available day
 *   };
 */
type Modifiers = Record< string, boolean >;

/**
 * A value or a function that matches a specific day.
 * @example
 *   // will always match the day
 *   const booleanMatcher: Matcher = true;
 *
 *   // will match the today's date
 *   const dateMatcher: Matcher = new Date();
 *
 *   // will match the days in the array
 *   const arrayMatcher: Matcher = [
 *     new Date(2019, 1, 2),
 *     new Date(2019, 1, 4)
 *   ];
 *
 *   // will match days after the 2nd of February 2019
 *   const afterMatcher: DateAfter = { after: new Date(2019, 1, 2) };
 *
 *   // will match days before the 2nd of February 2019 }
 *   const beforeMatcher: DateBefore = { before: new Date(2019, 1, 2) };
 *
 *   // will match Sundays
 *   const dayOfWeekMatcher: DayOfWeek = {
 *     dayOfWeek: 0
 *   };
 *
 *   // will match the included days, except the two dates
 *   const intervalMatcher: DateInterval = {
 *     after: new Date(2019, 1, 2),
 *     before: new Date(2019, 1, 5)
 *   };
 *
 *   // will match the included days, including the two dates
 *   const rangeMatcher: DateRange = {
 *     from: new Date(2019, 1, 2),
 *     to: new Date(2019, 1, 5)
 *   };
 *
 *   // will match when the function return true
 *   const functionMatcher: Matcher = (day: Date) => {
 *     return day.getMonth() === 2; // match when month is March
 *   };
 */
type Matcher =
	| boolean
	| ( ( date: Date ) => boolean )
	| Date
	| Date[]
	| DateRange
	| DateBefore
	| DateAfter
	| DateInterval
	| DayOfWeek;
/**
 * Match a day falling after the specified date, with the date not included.
 * @example
 *   // Match days after the 2nd of February 2019
 *   const matcher: DateAfter = { after: new Date(2019, 1, 2) };
 */
type DateAfter = {
	after: Date;
};
/**
 * Match a day falling before the specified date, with the date not included.
 * @example
 *   // Match days before the 2nd of February 2019
 *   const matcher: DateBefore = { before: new Date(2019, 1, 2) };
 */
type DateBefore = {
	before: Date;
};
/**
 * An interval of dates. Differently from `DateRange`, the range ends here
 * are not included.
 * @example
 *   // Match the days between the 2nd and the 5th of February 2019
 *   const matcher: DateInterval = {
 *     after: new Date(2019, 1, 2),
 *     before: new Date(2019, 1, 5)
 *   };
 */
type DateInterval = {
	before: Date;
	after: Date;
};
/**
 * A range of dates. The range can be open. Differently from
 * `DateInterval`, the range ends here are included.
 * @example
 *   // Match the days between the 2nd and the 5th of February 2019
 *   const matcher: DateRange = {
 *     from: new Date(2019, 1, 2),
 *     to: new Date(2019, 1, 5)
 *   };
 */
type DateRange = {
	from: Date | undefined;
	to?: Date | undefined;
};
/**
 * Match dates being one of the specified days of the week (`0-6`, where `0` is
 * Sunday).
 * @example
 *   // Match Sundays
 *   const matcher: DayOfWeek = { dayOfWeek: 0 };
 *   // Match weekends
 *   const matcher: DayOfWeek = { dayOfWeek: [0, 6] };
 */
type DayOfWeek = {
	dayOfWeek: number | number[];
};

/**
 * Shared handler type for `onSelect` callback when a selection mode is set.
 * @template T - The type of the selected item.
 * @callback OnSelectHandler
 * @param {T} selected - The selected item after the event.
 * @param {Date} triggerDate - The date when the event was triggered.
 * @param {Modifiers} modifiers - The modifiers associated with the event.
 * @param {React.MouseEvent | React.KeyboardEvent} e - The event object.
 */
export type OnSelectHandler< T > = (
	selected: T,
	triggerDate: Date,
	modifiers: Modifiers,
	e: React.MouseEvent | React.KeyboardEvent
) => void;

interface BaseProps extends Omit< React.HTMLAttributes< HTMLDivElement >, 'onSelect' > {
	/**
	 * Whether the selection is required.
	 */
	required?: boolean | undefined;

	/**
	 * The initial month to show in the calendar view (uncontrolled).
	 * @default The current month
	 */
	defaultMonth?: Date;
	/**
	 * The month displayed in the calendar view (controlled). Use together with
	 * `onMonthChange` to change the month programmatically.
	 */
	month?: Date;
	/**
	 * The number of months displayed at once.
	 * @default 1
	 */
	numberOfMonths?: number;
	/**
	 * The earliest month to start the month navigation.
	 */
	startMonth?: Date;
	/**
	 * The latest month to end the month navigation.
	 */
	endMonth?: Date;
	/**
	 * Add a footer to the calendar, acting as a live region.
	 *
	 * Use this prop to communicate the calendar's status to screen readers.
	 * Prefer strings over complex UI elements.
	 */
	footer?: React.ReactNode | string;
	/**
	 * Specify which days are disabled.
	 */
	disabled?: Matcher | Matcher[] | undefined;
	/**
	 * Add modifiers to the matching days.
	 */
	modifiers?: Record< string, Matcher | Matcher[] | undefined > | undefined;
	/**
	 * Use custom labels, useful for translating the component.
	 */
	labels?: {
		/**
		 * The label for the navigation toolbar.
		 * @default ""
		 */
		labelNav?: () => string;
		/**
		 * The label for the month grid.
		 * @default "LLLL y" (e.g. "November 2022")
		 */
		labelGrid?: ( date: Date ) => string;
		/**
		 * The label for the gridcell, when the calendar is not interactive.
		 * @default The formatted date.
		 */
		labelGridcell?: ( date: Date, modifiers?: Modifiers ) => string;
		/**
		 * The label for the "next month" button.
		 * @default "Go to the Next Month"
		 */
		labelNext?: ( month: Date | undefined ) => string;
		/**
		 * The label for the "previous month" button.
		 * @default "Go to the Previous Month"
		 */
		labelPrevious?: ( month: Date | undefined ) => string;
		/**
		 * The label for the day button.
		 * @default The formatted date.
		 */
		labelDayButton?: ( date: Date, modifiers?: Modifiers ) => string;
		/**
		 * The label for the weekday.
		 * @default "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
		 */
		labelWeekday?: ( date: Date ) => string;
	};

	/**
	 * The locale object used to localize dates. Pass a locale from
	 * `date-fns/locale` to localize the calendar.
	 * @see https://github.com/date-fns/date-fns/tree/main/src/locale for a list of the supported locales
	 */
	locale?: Locale;
	/**
	 * Event fired when the user navigates between months.
	 */
	onMonthChange?: ( month: Date ) => void;
}

interface SinglePropsRequired {
	required: true;
	/** The selected date. */
	selected: Date | undefined;
	/** Event handler when a day is selected. */
	onSelect?: OnSelectHandler< Date >;
}

interface SinglePropsOptional {
	required?: false | undefined;
	/** The selected date. */
	selected?: Date | undefined;
	/** Event handler when a day is selected. */
	onSelect?: OnSelectHandler< Date | undefined >;
}

interface RangeProps {
	/**
	 * When `true`, the range will reset when including a disabled day.
	 */
	excludeDisabled?: boolean;
	/** The minimum number of days to include in the range. */
	min?: number;
	/** The maximum number of days to include in the range. */
	max?: number;
}

interface RangePropsRequired {
	required: true;
	/** The selected range. */
	selected: DateRange | undefined;
	/** Event handler when a range is selected. */
	onSelect?: OnSelectHandler< DateRange >;
}

interface RangePropsOptional {
	required?: false | undefined;
	/** The selected range. */
	selected?: DateRange | undefined;
	/** Event handler when the selection changes. */
	onSelect?: OnSelectHandler< DateRange | undefined >;
}

export type DateCalendarProps = BaseProps & ( SinglePropsRequired | SinglePropsOptional );
export type DateRangeCalendarProps = BaseProps &
	RangeProps &
	( RangePropsRequired | RangePropsOptional );
