import styles from '../styles.module.scss';
import { Day } from './day-cell';

const CLASSNAMES = {
	root: styles[ 'calendar' ],
	day: styles[ 'calendar__day' ],
	day_button: styles[ 'calendar__day-button' ],
	caption_label: styles[ 'calendar__caption-label' ],
	button_next: styles[ 'calendar__button-next' ],
	button_previous: styles[ 'calendar__button-previous' ],
	chevron: styles[ 'calendar__chevron' ],
	nav: styles[ 'calendar__nav' ],
	month_caption: styles[ 'calendar__month-caption' ],
	months: styles[ 'calendar__months' ],
	month_grid: styles[ 'calendar__month-grid' ],
	weekday: styles[ 'calendar__weekday' ],
	today: styles[ 'calendar__day--today' ],
	selected: styles[ 'calendar__day--selected' ],
	disabled: styles[ 'calendar__day--disabled' ],
	hidden: styles[ 'calendar__day--hidden' ],
	range_start: styles[ 'calendar__range-start' ],
	range_end: styles[ 'calendar__range-end' ],
	range_middle: styles[ 'calendar__range-middle' ],
	weeks_before_enter: styles[ 'calendar__weeks-before-enter' ],
	weeks_before_exit: styles[ 'calendar__weeks-before-exit' ],
	weeks_after_enter: styles[ 'calendar__weeks-after-enter' ],
	weeks_after_exit: styles[ 'calendar__weeks-after-exit' ],
	caption_after_enter: styles[ 'calendar__caption-after-enter' ],
	caption_after_exit: styles[ 'calendar__caption-after-exit' ],
	caption_before_enter: styles[ 'calendar__caption-before-enter' ],
	caption_before_exit: styles[ 'calendar__caption-before-exit' ],
};
export const MODIFIER_CLASSNAMES = {
	preview: styles[ 'calendar__day--preview' ],
	preview_start: styles[ 'calendar__day--preview-start' ],
	preview_end: styles[ 'calendar__day--preview-end' ],
};

export const COMMON_PROPS = {
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
