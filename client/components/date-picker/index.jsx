/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker';
import { noop, merge, map, filter, get, debounce } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import DayItem from './day';
import DatePickerNavBar from './nav-bar';

/**
 * Style dependencies
 */
import './style.scss';

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
			PropTypes.func,
		] ),
		disabledDays: PropTypes.array,
		locale: PropTypes.string,
		localeUtils: PropTypes.shape( {
			// http://react-day-picker.js.org/api/LocaleUtils
			formatDay: PropTypes.func,
			formatMonthTitle: PropTypes.func,
			formatWeekdayLong: PropTypes.func,
			formatWeekdayShort: PropTypes.func,
			getFirstDayOfWeek: PropTypes.func,
			getMonths: PropTypes.func,
		} ),
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
		onDayTouchStart: PropTypes.func,
		onDayTouchEnd: PropTypes.func,
		onDayTouchMove: PropTypes.func,
		rootClassNames: PropTypes.object,
	};

	static defaultProps = {
		showOutsideDays: true,
		calendarViewDate: new Date(),
		calendarInitialDate: new Date(),
		modifiers: {},
		fromMonth: null,
		locale: 'en',
		selectedDay: null,
		onMonthChange: noop,
		onSelectDay: noop,
		onDayMouseEnter: noop,
		onDayMouseLeave: noop,
		onDayTouchStart: noop,
		onDayTouchEnd: noop,
		onDayTouchMove: noop,
		rootClassNames: {},
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

		let i, event;
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

	getLocaleUtils() {
		const { moment, localeUtils } = this.props;
		const localeData = moment().localeData();
		const firstDayOfWeek = localeData.firstDayOfWeek();
		const weekdaysMin = moment.weekdaysMin();
		const weekdays = moment.weekdays();
		const utils = {
			formatDay: function ( date ) {
				return moment( date ).format( 'llll' );
			},

			formatMonthTitle: function ( date ) {
				return moment( date ).format( 'MMMM YYYY' );
			},

			formatWeekdayShort: function ( day ) {
				return get( weekdaysMin, day, ' ' )[ 0 ];
			},

			formatWeekdayLong: function ( day ) {
				return weekdays[ day ];
			},

			getFirstDayOfWeek: function () {
				return firstDayOfWeek;
			},

			formatMonthShort: function ( month ) {
				return moment( month.toISOString() ).format( 'MMM' );
			},
		};

		return merge( {}, utils, localeUtils );
	}

	/**
	 * Handler for the click/touch events on the calendar
	 * Debounced to avoid multiple calls to this method
	 * being fired for due to touch/click both being
	 * called on touch devices.
	 *
	 * See https://github.com/Automattic/wp-calypso/pull/29938/
	 */
	setCalendarDay = debounce(
		( day, modifiers ) => {
			const momentDay = this.props.moment( day );

			if ( modifiers.disabled ) {
				return null;
			}

			const dateMods = {
				year: momentDay.year(),
				month: momentDay.month(),
				date: momentDay.date(),
			};

			const date = ( this.props.timeReference || momentDay ).set( dateMods );

			this.props.onSelectDay( date, dateMods, modifiers );
		},
		500,
		{
			leading: true, // invoke call immediately
			trailing: false, // debounce any subsequent calls
		}
	);

	getDateInstance( v ) {
		return this.props.moment( v ).toDate();
	}

	renderDay = ( date, modifiers ) => (
		<DayItem
			date={ date }
			modifiers={ modifiers }
			onMouseEnter={ this.handleDayMouseEnter }
			onMouseLeave={ this.handleDayMouseLeave }
		/>
	);

	handleDayMouseEnter = ( date, modifiers, event ) => {
		const eventsByDay = this.filterEventsByDay( date );
		this.props.onDayMouseEnter( date, modifiers, event, eventsByDay );
	};

	handleDayMouseLeave = ( date, modifiers, event ) => {
		const eventsByDay = this.filterEventsByDay( date );
		this.props.onDayMouseLeave( date, modifiers, event, eventsByDay );
	};

	handleDayTouchMove = ( date, modifiers, event ) => {
		const eventsByDay = this.filterEventsByDay( date );
		this.props.onDayTouchMove( date, modifiers, event, eventsByDay );
	};

	render() {
		const modifiers = {
			...this.props.modifiers,
			'past-days': { before: new Date() },
			sunday: { daysOfWeek: [ 0 ] },
		};

		if ( this.props.selectedDay ) {
			modifiers[ 'is-selected' ] = this.getDateInstance( this.props.selectedDay );
		}

		if ( this.props.events && this.props.events.length ) {
			modifiers.events = map(
				filter( this.props.events, ( event ) => event.date ),
				( event ) => this.getDateInstance( event.date )
			);
		}

		const numMonths = this.props.numberOfMonths || 1;
		const rangeSelected = modifiers.start && modifiers.end;

		const rootClassNames = classNames( {
			'date-picker': true,
			'date-picker--no-range-selected': ! rangeSelected,
			'date-picker--range-selected': rangeSelected,
			[ `date-picker--${ numMonths }up` ]: true,
			...this.props.rootClassNames,
		} );

		return (
			<DayPicker
				modifiers={ modifiers }
				className={ rootClassNames }
				disabledDays={ this.props.disabledDays }
				initialMonth={ this.props.calendarInitialDate }
				month={ this.props.calendarViewDate }
				fromMonth={ this.props.fromMonth }
				toMonth={ this.props.toMonth }
				onDayClick={ this.setCalendarDay }
				onDayTouchStart={ this.setCalendarDay }
				onDayTouchEnd={ this.setCalendarDay }
				onDayTouchMove={ this.handleDayTouchMove }
				renderDay={ this.renderDay }
				locale={ this.props.locale }
				localeUtils={ this.getLocaleUtils() }
				onMonthChange={ this.props.onMonthChange }
				showOutsideDays={ this.props.showOutsideDays }
				navbarElement={ <DatePickerNavBar /> }
				selectedDays={ this.props.selectedDays }
				numberOfMonths={ this.props.numberOfMonths }
			/>
		);
	}
}

export default localize( withLocalizedMoment( DatePicker ) );
