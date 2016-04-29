/**
 * External dependencies
 */
import React from 'react';
import DayPicker from 'react-day-picker';
import merge from 'lodash/merge';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import DayItem from 'components/date-picker/day';

/* Internal dependencies
 */
module.exports = React.createClass( {
	displayName: 'DatePicker',

	propTypes: {
		calendarViewDate: React.PropTypes.object,
		enableOutsideDays: React.PropTypes.bool,
		events: React.PropTypes.array,
		locale: React.PropTypes.object,

		selectedDay: React.PropTypes.object,
		timeReference: React.PropTypes.object,

		onMonthChange: React.PropTypes.func,
		onSelectDay: React.PropTypes.func
	},

	getDefaultProps: function() {
		return {
			enableOutsideDays: true,
			calendarViewDate: new Date(),
			selectedDay: null,
			onMonthChange: noop,
			onSelectDay: noop
		};
	},

	isSameDay: function( d0, d1 ) {
		d0 = this.moment( d0 );
		d1 = this.moment( d1 );
		return d0.isSame( d1, 'day' );
	},

	filterEventsByDay: function( day ) {
		var i, event, eventsInDay = [];

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
	},

	locale: function() {
		var moment = this.moment,
			localeData = moment().localeData(),
			locale = {
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
	},

	setCalendarDay: function( event, clickedDay ) {
		clickedDay = this.moment( clickedDay );

		let modifiers = {
			year: clickedDay.year(),
			month: clickedDay.month(),
			date: clickedDay.date()
		};

		let date = ( this.props.timeReference || clickedDay ).set( modifiers );

		this.props.onSelectDay( date, modifiers );
	},

	handleCaptionClick: function() {
		var daypicker = this.refs.daypicker;
		daypicker.showMonth( new Date() );
	},

	renderDay: function( day ) {
		var isSelected = this.props.selectedDay &&
			this.isSameDay( this.props.selectedDay, day );

		return (
			<DayItem
				selected={ isSelected }
				events={ this.filterEventsByDay( day ) }
				date={ day }
			/>
		);
	},

	render: function() {
		return (
			<div className="date-picker_container">
				<DayPicker
					ref="daypicker"
					className="date-picker"
					initialMonth={ this.props.calendarViewDate }
					renderDay={ this.renderDay }
					localeUtils={ this.locale() }
					onDayClick={ this.setCalendarDay }
					onMonthChange={ this.props.onMonthChange }
					enableOutsideDays={ this.props.enableOutsideDays }
					onCaptionClick={ this.handleCaptionClick }>
				</DayPicker>
			</div>
		);
	}
} );
