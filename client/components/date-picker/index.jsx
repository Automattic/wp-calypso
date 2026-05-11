import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { map, filter } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { DayPicker } from 'react-day-picker';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import DatePickerDay from './day';
import { DatePickerPreviousMonthButton, DatePickerNextMonthButton } from './nav-bar';

import './style.scss';

const noop = () => {};

// react-day-picker v9 emits `rdp-*` classes by default. We override every entry
// back to the v7-era `DayPicker-*` names this wrapper's SCSS (and consumer
// SCSS) still targets, so the visual styling is preserved without rewriting
// every selector.
const CLASS_NAMES = {
	root: 'DayPicker',
	months: 'DayPicker-Months',
	month: 'DayPicker-Month-Wrapper',
	month_grid: 'DayPicker-Month',
	month_caption: 'DayPicker-Caption',
	caption_label: 'DayPicker-CaptionLabel',
	weekdays: 'DayPicker-Weekdays',
	weekday: 'DayPicker-Weekday',
	weeks: 'DayPicker-Body',
	week: 'DayPicker-Week',
	day: 'DayPicker-Day',
	day_button: 'DayPicker-DayButton',
	nav: 'DayPicker-NavBar',
	button_previous: 'DayPicker-NavButton DayPicker-NavButton--prev',
	button_next: 'DayPicker-NavButton DayPicker-NavButton--next',
	chevron: 'DayPicker-Chevron',
	today: 'DayPicker-Day--today',
	outside: 'DayPicker-Day--outside',
	disabled: 'DayPicker-Day--disabled',
	hidden: 'DayPicker-Day--hidden',
	selected: 'DayPicker-Day--selected',
};

// Same remap for matched modifiers: v9's default is `rdp-day_<name>`; we map
// every modifier this wrapper adds (and the ones consumers pass through) back
// to the v7-era `DayPicker-Day--<name>` names the SCSS expects.
const MODIFIERS_CLASS_NAMES = {
	'past-days': 'DayPicker-Day--past-days',
	sunday: 'DayPicker-Day--sunday',
	'is-selected': 'DayPicker-Day--is-selected',
	events: 'DayPicker-Day--events',
	start: 'DayPicker-Day--start',
	end: 'DayPicker-Day--end',
	range: 'DayPicker-Day--range',
	'range-start': 'DayPicker-Day--range-start',
	'range-end': 'DayPicker-Day--range-end',
};

function determineSelectionModeFromProps( selectedDay, selectedDays ) {
	const isPlainDateRange = ( value ) =>
		!! value &&
		typeof value === 'object' &&
		! ( value instanceof Date ) &&
		( 'from' in value || 'to' in value );

	if ( selectedDays instanceof Date ) {
		return { mode: 'single', selected: selectedDays };
	}
	if ( isPlainDateRange( selectedDays ) ) {
		return { mode: 'range', selected: selectedDays };
	}
	if ( Array.isArray( selectedDays ) ) {
		const range = selectedDays.find( isPlainDateRange );
		if ( range ) {
			return { mode: 'range', selected: range };
		}
		return { mode: 'multiple', selected: selectedDays.filter( ( d ) => d instanceof Date ) };
	}
	if ( selectedDay instanceof Date ) {
		return { mode: 'single', selected: selectedDay };
	}
	return { mode: 'single', selected: undefined };
}

// Safe because react-day-picker always hands us `nextMonth` as first-of-month
// (it normalises via `dateLib.startOfMonth` before pagination — see
// `helpers/getNextMonth.js`). Day-1 exists in every month, so `setMonth(n + 1)`
// can't overflow into the following month the way it would for, say, Jan 31.
function addMonths( date, n ) {
	const result = new Date( date );
	result.setMonth( result.getMonth() + n );
	return result;
}

class DatePicker extends PureComponent {
	static propTypes = {
		calendarViewDate: PropTypes.object,
		calendarInitialDate: PropTypes.object,
		showOutsideDays: PropTypes.bool,
		numberOfMonths: PropTypes.number,
		events: PropTypes.array,
		selectedDays: PropTypes.oneOfType( [
			PropTypes.instanceOf( Date ),
			PropTypes.shape( {
				from: PropTypes.instanceOf( Date ),
				to: PropTypes.instanceOf( Date ),
			} ),
			PropTypes.array,
		] ),
		disabledDays: PropTypes.array,
		modifiers: PropTypes.object,
		moment: PropTypes.func.isRequired,
		selectedDay: PropTypes.object,
		timeReference: PropTypes.object,
		onMonthChange: PropTypes.func,
		onSelectDay: PropTypes.func,
		onDayMouseEnter: PropTypes.func,
		onDayMouseLeave: PropTypes.func,
		toMonth: PropTypes.object,
		fromMonth: PropTypes.object,
		rootClassNames: PropTypes.object,
		useArrowNavigation: PropTypes.bool,
		formatMonthTitle: PropTypes.func,
	};

	static defaultProps = {
		showOutsideDays: true,
		modifiers: {},
		onMonthChange: noop,
		onSelectDay: noop,
		onDayMouseEnter: noop,
		onDayMouseLeave: noop,
		rootClassNames: {},
		useArrowNavigation: false,
	};

	// `month` on react-day-picker is strictly controlled: the calendar won't
	// change its displayed month unless the consumer re-passes a new value.
	// Consumers in this repo (DateRange, DateControl) pass a static
	// `focusedMonth` and don't listen to `onMonthChange`, so prev/next clicks
	// would otherwise be no-ops. The wrapper holds its own "displayed month",
	// re-seeded from the consumer prop whenever it changes (tracked via
	// `lastSyncedConsumerInputs`) and updated by v9 navigation events.
	state = {
		displayedMonth: DatePicker.computeDisplayedMonth( this.props ),
		lastSyncedConsumerInputs: DatePicker.consumerInputsKey( this.props ),
	};

	static consumerInputsKey( props ) {
		return [ props.calendarViewDate, props.toMonth, props.numberOfMonths ];
	}

	static computeDisplayedMonth( props ) {
		// v9's getDisplayMonths truncates the display when `firstDisplayedMonth +
		// (numberOfMonths - 1) > endMonth`. If a consumer pins `calendarViewDate`
		// to a date inside `toMonth`'s month while requesting multiple months,
		// shift the first displayed month back so the cap stays visible as the
		// LAST month (the v7-era behaviour).
		let monthProp = props.calendarViewDate || undefined;
		const numberOfMonths = props.numberOfMonths || 1;
		if ( monthProp && props.toMonth && numberOfMonths > 1 ) {
			const endMonthFirstDay = new Date( props.toMonth.getFullYear(), props.toMonth.getMonth(), 1 );
			const lastDisplayed = addMonths( monthProp, numberOfMonths - 1 );
			if ( lastDisplayed > endMonthFirstDay ) {
				monthProp = addMonths( endMonthFirstDay, -( numberOfMonths - 1 ) );
			}
		}
		return monthProp;
	}

	static getDerivedStateFromProps( props, state ) {
		const nextKey = DatePicker.consumerInputsKey( props );
		const sameAsLast = nextKey.every(
			( value, i ) => value === state.lastSyncedConsumerInputs[ i ]
		);
		if ( sameAsLast ) {
			return null;
		}
		return {
			displayedMonth: DatePicker.computeDisplayedMonth( props ),
			lastSyncedConsumerInputs: nextKey,
		};
	}

	handleMonthChange = ( newMonth ) => {
		this.setState( { displayedMonth: newMonth } );
		this.props.onMonthChange( newMonth );
	};

	isSameDay( d0, d1 ) {
		d0 = this.props.moment( d0 );
		d1 = this.props.moment( d1 );

		return d0.isSame( d1, 'day' );
	}

	filterEventsByDay( day ) {
		if ( ! this.props.events ) {
			return [];
		}

		let i;
		let event;
		const eventsInDay = [];

		for ( i = 0; i < this.props.events.length; i++ ) {
			event = this.props.events[ i ];

			if ( this.isSameDay( event.date, day ) ) {
				if ( typeof event.id === 'undefined' ) {
					event.id = `event-${ i }`;
				}

				eventsInDay.push( event );
			}
		}

		return eventsInDay;
	}

	getDateInstance( v ) {
		return this.props.moment( v ).toDate();
	}

	handleDayClick = ( day, dayModifiers ) => {
		if ( dayModifiers.disabled ) {
			return;
		}
		const { moment, timeReference, onSelectDay } = this.props;
		const dateMods = {
			year: day.getFullYear(),
			month: day.getMonth(),
			date: day.getDate(),
		};
		const momentDay = moment( day );
		const result = ( timeReference || momentDay ).set( dateMods );
		onSelectDay( result, dateMods, dayModifiers );
	};

	handleDayMouseEnter = ( day, dayModifiers, event ) => {
		this.props.onDayMouseEnter( day, dayModifiers, event, this.filterEventsByDay( day ) );
	};

	handleDayMouseLeave = ( day, dayModifiers, event ) => {
		this.props.onDayMouseLeave( day, dayModifiers, event, this.filterEventsByDay( day ) );
	};

	formatCaption = ( date ) => {
		if ( typeof this.props.formatMonthTitle === 'function' ) {
			const result = this.props.formatMonthTitle( date );
			return result == null ? '' : result;
		}
		return this.props.moment( date ).format( 'MMMM YYYY' );
	};

	// Single-letter weekday headers, matching the v7 wrapper. Works for Latin
	// ("Mo" → "M"), CJK (already one char), Cyrillic/Greek/Arabic. Doesn't
	// handle UTF-16 surrogate pairs but no moment locale ships such weekdays.
	formatWeekdayName = ( date ) => this.props.moment( date ).format( 'dd' )[ 0 ];

	// v9 dates land at midnight; v7's internal grid used noon (avoids DST
	// surprises in the moment `llll` format). Pin to noon so the rendered
	// aria-label matches v7's output exactly: e.g. "Thu, Oct 4, 2018 12:00 PM".
	formatLabelDayButton = ( date ) => {
		const noon = new Date( date );
		noon.setHours( 12, 0, 0, 0 );
		return this.props.moment( noon ).format( 'llll' );
	};

	// v9 invokes the label callbacks immediately before rendering the matching
	// PreviousMonthButton / NextMonthButton, so storing the date on `this`
	// lets the button overrides read it without us having to recompute v9's
	// navigation math.
	formatLabelPrevious = ( date ) => {
		this.prevNavMonth = date;
		if ( ! date ) {
			return this.props.translate( 'Previous month' );
		}
		return this.props.translate( 'Previous month (%s)', {
			comment: 'Aria label for date picker controls',
			args: this.formatCaption( date ),
		} );
	};

	// v9's `nextMonth` is the IMMEDIATE next month; v7 advertised the *last*
	// visible month for multi-month displays ("Next month (December 2018)"
	// when showing Oct+Nov). Re-shift here so existing aria labels are
	// preserved.
	formatLabelNext = ( date ) => {
		const numberOfMonths = this.props.numberOfMonths || 1;
		const adjusted = date && numberOfMonths > 1 ? addMonths( date, numberOfMonths - 1 ) : date;
		this.nextNavMonth = adjusted;
		if ( ! adjusted ) {
			return this.props.translate( 'Next month' );
		}
		return this.props.translate( 'Next month (%s)', {
			comment: 'Aria label for date picker controls',
			args: this.formatCaption( adjusted ),
		} );
	};

	renderPreviousMonthButton = ( buttonProps ) => (
		<DatePickerPreviousMonthButton
			{ ...buttonProps }
			useArrowNavigation={ this.props.useArrowNavigation }
			monthDate={ this.prevNavMonth }
		/>
	);

	renderNextMonthButton = ( buttonProps ) => (
		<DatePickerNextMonthButton
			{ ...buttonProps }
			useArrowNavigation={ this.props.useArrowNavigation }
			monthDate={ this.nextNavMonth }
		/>
	);

	render() {
		const {
			calendarInitialDate,
			showOutsideDays,
			numberOfMonths,
			events,
			selectedDays,
			disabledDays,
			modifiers: extraModifiers,
			selectedDay,
			toMonth,
			fromMonth,
			rootClassNames,
		} = this.props;

		const { mode, selected } = determineSelectionModeFromProps( selectedDay, selectedDays );

		const modifiers = {
			...extraModifiers,
			'past-days': { before: new Date() },
			sunday: { dayOfWeek: [ 0 ] },
		};
		if ( selectedDay ) {
			modifiers[ 'is-selected' ] = this.getDateInstance( selectedDay );
		}

		if ( events && events.length ) {
			modifiers.events = map(
				filter( events, ( event ) => event.date ),
				( event ) => this.getDateInstance( event.date )
			);
		}

		const numMonths = numberOfMonths || 1;
		const rangeSelected = modifiers.start && modifiers.end;
		const className = clsx( {
			'date-picker': true,
			'date-picker--no-range-selected': ! rangeSelected,
			'date-picker--range-selected': rangeSelected,
			[ `date-picker--${ numMonths }up` ]: true,
			...rootClassNames,
		} );

		const components = {
			DayButton: DatePickerDay,
			PreviousMonthButton: this.renderPreviousMonthButton,
			NextMonthButton: this.renderNextMonthButton,
		};

		return (
			<DayPicker
				modifiers={ modifiers }
				modifiersClassNames={ MODIFIERS_CLASS_NAMES }
				className={ className }
				classNames={ CLASS_NAMES }
				disabled={ disabledDays }
				defaultMonth={ calendarInitialDate || undefined }
				month={ this.state.displayedMonth }
				startMonth={ fromMonth || undefined }
				endMonth={ toMonth || undefined }
				weekStartsOn={ this.props.moment().localeData().firstDayOfWeek() }
				navLayout="around"
				onDayClick={ this.handleDayClick }
				components={ components }
				formatters={ {
					formatCaption: this.formatCaption,
					formatWeekdayName: this.formatWeekdayName,
				} }
				labels={ {
					labelDayButton: this.formatLabelDayButton,
					labelPrevious: this.formatLabelPrevious,
					labelNext: this.formatLabelNext,
				} }
				onMonthChange={ this.handleMonthChange }
				showOutsideDays={ showOutsideDays }
				mode={ mode }
				required={ false }
				selected={ selected }
				onSelect={ noop }
				numberOfMonths={ numberOfMonths }
				onDayMouseEnter={ this.handleDayMouseEnter }
				onDayMouseLeave={ this.handleDayMouseLeave }
			/>
		);
	}
}

export default localize( withLocalizedMoment( DatePicker ) );
