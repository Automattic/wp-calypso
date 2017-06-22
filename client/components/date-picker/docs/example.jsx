/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DatePicker from 'components/date-picker';
import EventsTooltip from 'components/date-picker/events-tooltip';

const events = [
	{
		title: 'Today',
		date: new Date(),
		type: 'scheduled'
	},

	{
		title: 'Social Media - Facebook',
		date: new Date( +new Date() + 60 * 60 * 24 * 1000 ),
		socialIcon: 'facebook',
	},

	{
		title: 'Social Media - Twitter',
		date: new Date(),
		socialIcon: 'twitter',
		socialIconColor: false,
	},

	{
		title: 'Social Media - Google Plus',
		date: new Date(),
		socialIcon: 'google-plus',
	},

	{
		title: 'Social Media - LinkedIn',
		date: new Date(),
		socialIcon: 'linkedin',
	},

	{
		title: 'Social Media - Tumblr',
		date: new Date( +new Date() + 60 * 60 * 24 * 1000 ),
		socialIcon: 'tumblr',
	},

	{
		title: 'Social Media - Path',
		date: new Date(),
		socialIcon: 'path',
		socialIconColor: false,
	},

	{
		title: 'Social Media - Eventbrite',
		date: new Date(),
		socialIcon: 'eventbrite',
		socialIconColor: false,
	},

	{
		title: 'Gridicon - Time',
		date: new Date(),
		icon: 'time',
	},

	{
		title: 'Gridicon - Offline',
		date: new Date(),
		icon: 'offline',
	},

	{
		title: 'Gridicon - Shipping',
		date: new Date(),
		icon: 'shipping',
	},

	{
		title: 'Tomorrow is tomorrow',
		date: new Date( +new Date() + 60 * 60 * 24 * 1000 ),
		type: 'future',
	},
	{
		title: 'Yesterday',
		date: new Date( +new Date() - 60 * 60 * 24 * 1000 ),
		type: 'past',
	},
	{
		title: 'Retro birthday',
		date: new Date( '1977-07-18' ),
		type: 'birthday',
		icon: 'offline',
	}
];

/*
 * Date Picker Demo
 */
class DatePickerExample extends Component {
	state = {
		dayEvents: [],
		showTooltip: false,
	};

	selectDay = ( date, modifiers ) => {
		this.setState( { selectedDay: date } );

		if ( date ) {
			console.log( date.toDate(), modifiers ); // eslint-disable-line no-console
		}
	};

	handleDayMouseEnter = ( date, modifiers, event, dayEvents ) => {
		this.setState( {
			dayEvents,
			context: event.target,
			showTooltip: true,
		} );
	};

	handleDayMouseLeave = () => {
		this.setState( {
			dayEvents: [],
			context: null,
			showTooltip: false,
		} );
	};

	render() {
		return (
			<Card style={ { width: '300px', margin: 0 } }>
				<DatePicker
					disabledDays={ [ { before: new Date() } ] }
					events={ events }
					onSelectDay={ this.selectDay }
					onDayMouseEnter={ this.handleDayMouseEnter }
					onDayMouseLeave={ this.handleDayMouseLeave }
					selectedDay={ this.state.selectedDay } />

				<EventsTooltip
					events={ this.state.dayEvents }
					context={ this.state.context }
					isVisible={ this.state.showTooltip }
				/>
			</Card>
		);
	}
}

DatePickerExample.displayName = 'DatePicker';

export default DatePickerExample;

