DatePicker
==========

React component used to display a Date Picker.

---

## Example Usage

```js
var DatePicker = require( 'components/date-picker' );

module.exports = React.createClass( {

	// ...

	this.onSelect: function( date ) {
		this.setState( { date: date } );
	},

	render: function() {
		var events = [
			{
				title: '1 other post scheduled',
				date: new Date( '2015-10-15 10:30' ),
				type: 'schedulled'
			},
			{
				title: 'Happy birthday Damian!',
				date: new Date( '2015-07-18 15:00' )
			}
		];

		return (
			<DatePicker
				initialMonth = { new Date( '2015-07-01' ) }
				events= { events }
				onSelect= { this.onSelect }
				selectedDay= { this.state.date } >
			</DatePicker>
		);
	}

} );
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

`onSelect` - **optional**

`onMonthChange` - **optional**

------------
