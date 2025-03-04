export type CalendarEvent = {
	/**
	 * The date of the event.
	 */
	date: Date;
};

export type CalendarProps = {
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
	events?: CalendarEvent[];

	/**
	 * The day that the week should start on. 0 for Sunday, 1 for Monday, etc.
	 * @default 0
	 */
	startOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};
