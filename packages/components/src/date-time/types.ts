/**
 * Internal dependencies
 */
import type { MinutesInput } from './time/styles';

export type TimePickerProps = {
	/**
	 * The initial current time the time picker should render.
	 */
	currentTime?: Date | string | number | null;

	/**
	 * Whether we use a 12-hour clock. With a 12-hour clock, an AM/PM widget is
	 * displayed and the time format is assumed to be `MM-DD-YYYY` (as opposed
	 * to the default format `DD-MM-YYYY`).
	 */
	is12Hour?: boolean;

	/**
	 * The order of day, month, and year. This prop overrides the time format
	 * determined by `is12Hour` prop.
	 *
	 * @default 'dmy'
	 */
	dateOrder?: 'dmy' | 'mdy' | 'ymd';

	/**
	 * The function called when a new time has been selected. It is passed the
	 * time as an argument.
	 */
	onChange?: ( time: string ) => void;

	/**
	 * If true, the label will only be visible to screen readers.
	 *
	 * @default false
	 */
	hideLabelFromVision?: boolean;
};

export type TimeInputValue = {
	/**
	 * The hours value in 24-hour format.
	 */
	hours: number;

	/**
	 * The minutes value.
	 */
	minutes: number;
};

export type TimeInputProps = {
	/**
	 * Whether we use a 12-hour clock. With a 12-hour clock, an AM/PM widget is
	 * displayed
	 */
	is12Hour?: boolean;

	/**
	 * The time input object with hours and minutes values.
	 *
	 * - hours: number (24-hour format)
	 * - minutes: number
	 */
	value?: TimeInputValue;

	/**
	 * An optional default value for the control when used in uncontrolled mode.
	 * If left `undefined`, the current time will be used.
	 */
	defaultValue?: TimeInputValue;

	/**
	 * The props to pass down to the minutes input.
	 */
	minutesProps?: React.ComponentProps< typeof MinutesInput >;

	/**
	 * The label for the time input.
	 */
	label?: string;

	/**
	 * The function is called when a new time has been selected.
	 * Passing hours and minutes as an object properties.
	 */
	onChange?: ( time: TimeInputValue ) => void;
};

export type DatePickerEvent = {
	/**
	 * The date of the event.
	 */
	date: Date;
};

export type DatePickerProps = {
	/**
	 * The current date and time at initialization. Optionally pass in a `null`
	 * value to specify no date is currently selected.
	 */
	currentDate?: Date | string | number | null;

	/**
	 * The function called when a new date has been selected. It is passed the
	 * date as an argument.
	 */
	onChange?: ( date: string ) => void;

	/**
	 * A callback function which receives a Date object representing a day as an
	 * argument, and should return a Boolean to signify if the day is valid or
	 * not.
	 */
	isInvalidDate?: ( date: Date ) => boolean;

	/**
	 * A callback invoked when selecting the previous/next month in the date
	 * picker. The callback receives the new month date in the ISO format as an
	 * argument.
	 */
	onMonthPreviewed?: ( date: string ) => void;

	/**
	 * List of events to show in the date picker. Each event will appear as a
	 * dot on the day of the event.
	 */
	events?: DatePickerEvent[];

	/**
	 * The day that the week should start on. 0 for Sunday, 1 for Monday, etc.
	 *
	 * @default 0
	 */
	startOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export type DateTimePickerProps = Omit< DatePickerProps, 'onChange' > &
	Omit<
		TimePickerProps,
		'currentTime' | 'onChange' | 'hideLabelFromVision'
	> & {
		/**
		 * The function called when a new date or time has been selected. It is
		 * passed the date and time as an argument.
		 */
		onChange?: ( date: string | null ) => void;
	};
