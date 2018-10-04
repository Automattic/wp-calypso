DatePicker
==========

React component used to display a Date Picker.

---

## Example Usage

```js
import React from 'react';
import DatePicker from 'components/date-picker';

export default class extends React.Component {
	// ...

	this.onSelectDay: function( date ) {
		this.setState( { date: date } );
	},

	render() {
		var events = [
			{
				title: '1 other post scheduled',
				date: new Date( '2015-10-15 10:30' ),
				type: 'scheduled',
				icon: 'time',
			},
			{
				title: 'Happy birthday Damian!',
				date: new Date( '2015-07-18 15:00' ),
				socialIcon: 'path',
			}
		];

		return (
			<DatePicker
				initialMonth = { new Date( '2015-07-01' ) }
				events= { events }
				onSelectDay= { this.onSelectDay }
				selectedDay= { this.state.date } />
		);
	}
}
```

---

## DatePicker

#### Props

`initialMonth` - **optional** Date object that defines the month of the calendar. Default is `now`.

`selectedDay` - **optional** Moment instance to select the current day.

`timeReference` - **optional** Moment instance used to adjust the time when a day
is selected.

`events` - **optional** Array of events.

`className` - **optional** Add a custom class property.

`onSelectDay` - **optional** Called when day is selected by user.

`onMonthChange` - **optional** Called when month is changed by user.

------------
