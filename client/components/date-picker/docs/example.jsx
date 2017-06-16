/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DatePicker from 'components/date-picker';

/**
 * Date Picker Demo
 */
class DatePickerExample extends Component {
	state = {
		events: [
			{
				title: 'Today',
				date: new Date(),
				type: 'scheduled'
			},

			{
				title: 'Social media event',
				date: new Date(),
				socialIcon: 'twitter',
			},

			{
				title: 'Gridicon event',
				date: new Date(),
				icon: 'time',
			},

			{
				title: 'Tomorrow is tomorrow',
				date: new Date( +new Date() + 60 * 60 * 24 * 1000 ),
				type: 'future-event',
			},
			{
				title: 'Yesterday',
				date: new Date( +new Date() - 60 * 60 * 24 * 1000 ),
				type: 'past-event',
			}
		]
	};

	selectDay( date, modifiers ) {
		this.setState( { selectedDay: date } );

		if ( date ) {
			console.log( date.toDate(), modifiers );
		}
	}

	render() {
		return (
			<Card style={ { width: '300px', margin: 0 } }>
				<DatePicker
					events={ this.state.events }
					onSelectDay={ this.selectDay }
					selectedDay={ this.state.selectedDay }>
				</DatePicker>
			</Card>
		);
	}
}

DatePickerExample.displayName = 'DatePicker';

export default DatePickerExample;

