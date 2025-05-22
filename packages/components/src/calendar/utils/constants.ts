import { Day } from './day-cell';

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
export const MODIFIER_CLASSNAMES = {
	preview: `${ BASE_CLASSNAME }__day--preview`,
	preview_start: `${ BASE_CLASSNAME }__day--preview-start`,
	preview_end: `${ BASE_CLASSNAME }__day--preview-end`,
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
