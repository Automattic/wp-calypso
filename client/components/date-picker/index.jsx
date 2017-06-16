/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import DayPicker from 'react-day-picker';
import { noop, merge } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DayItem from 'components/date-picker/day';

/* Internal dependencies
 */
class DatePicker extends PureComponent {
	static propTypes = {
		calendarViewDate: PropTypes.object,
		enableOutsideDays: PropTypes.bool,
		events: PropTypes.array,
		locale: PropTypes.object,

		selectedDay: PropTypes.object,
		timeReference: PropTypes.object,

		onMonthChange: PropTypes.func,
		onSelectDay: PropTypes.func,
	};

	static defaultProps = {
		enableOutsideDays: true,
		calendarViewDate: new Date(),
		selectedDay: null,
		onMonthChange: noop,
		onSelectDay: noop,
	};

	isSameDay( d0, d1 ) {
		d0 = this.props.moment( d0 );
		d1 = this.props.moment( d1 );
		return d0.isSame( d1, 'day' );
	}

	filterEventsByDay( day ) {
		let i, event;
		const eventsInDay = [];

		if ( ! this.props.events ) {
			return [];
		}

		for ( i = 0; i < this.props.events.length; i++ ) {
			event = this.props.events[ i ];

			if ( this.isSameDay( event.date, day ) ) {
				eventsInDay.push( event );
			}
		}

		return eventsInDay;
	}

	locale() {
		const { moment } = this.props;
		const localeData = moment().localeData();

		const locale = {
			formatDay: function( date ) {
				return moment( date ).format( 'llll' );
			},

			formatMonthTitle: function( date ) {
				return moment( date ).format( 'MMMM YYYY' );
			},

			formatWeekdayShort: function( day ) {
				return moment().weekday( day ).format( 'dd' )[ 0 ];
			},

			formatWeekdayLong: function( day ) {
				return moment().weekday( day ).format( 'dddd' );
			},

			getFirstDayOfWeek: function() {
				return Number( localeData.firstDayOfWeek() );
			}
		};

		return merge( locale, this.props.locale );
	}

	setCalendarDay = ( event, clickedDay ) => {
		clickedDay = this.props.moment( clickedDay );

		const modifiers = {
			year: clickedDay.year(),
			month: clickedDay.month(),
			date: clickedDay.date()
		};

		const date = ( this.props.timeReference || clickedDay ).set( modifiers );

		this.props.onSelectDay( date, modifiers );
	};

	setCalendarMonth = () => {
		const { daypicker } = this.refs;
		daypicker.showMonth( new Date() );
	};

	renderDay = day => {
		const isSelected = this.props.selectedDay && this.isSameDay( this.props.selectedDay, day );

		return (
			<DayItem
				selected={ isSelected }
				events={ this.filterEventsByDay( day ) }
				date={ day } />
		);
	};

	render() {
		return (
			<DayPicker
				ref="daypicker"
				className="date-picker"
				initialMonth={ this.props.calendarViewDate }
				renderDay={ this.renderDay }
				localeUtils={ this.locale() }
				onDayClick={ this.setCalendarDay }
				onMonthChange={ this.props.onMonthChange }
				enableOutsideDays={ this.props.enableOutsideDays }
				onCaptionClick={ this.setCalendarMonth } />
		);
	}
}

export default localize( DatePicker );

