# PostSchedule

This React component implements a small calendar (shown by month) which allows us to select a date through its interface. PostSchedule can be localized to display days/events in a given timezone by passing in a `timezone` or `gmtOffset` properties.

---

## Example Usage

```js
import PostSchedule from 'calypso/components/post-schedule';

export default class extends React.Component {
	// ...

	onDateChange( date ) {
		console.log( 'current date: ', date );
	}

	render() {
		const events = [
			{
				id: 1,
				title: 'My daily post',
				date: new Date( '2015-10-15 10:30' ),
				type: 'personal',
			},
			{
				id: 2,
				title: 'Happy Birthday!',
				date: new Date( '2015-07-18 15:00' ),
			},
		];

		return (
			<PostSchedule
				onDateChange={ this.onDateChange }
				timezone="America/Los_Angeles"
				events={ events }
			/>
		);
	}

	// ...
}
```

---

## PostSchedule

### Props

`events` - **optional** Array - Events array to print into the calendar.

`selectedDay` - **optional** Moment - Takes instance of Date object to set the selected day.

`timezone` - **optional** String (e.g., 'America/Los_Angeles') - Applies offset
correction when the given timezone is different from the user's timezone. `timezone` takes priority over `gmtOffset`.

`gmtOffset` - **optional** Number - Like as timezone-like manner, an offset correction will be applied if there is difference between the given gmtOffset and the user's gmtOffset. Ignored if `timezone` also passed.

`displayInputChrono` - **optional** Boolean - True if an `InputChrono` (a React component that creates a Date object from a user-entered textual date description) should be displayed. Default: true

`onDateChange` - **optional** Called when user selects a new date on the calendar. Passed a moment Date object.

`onMonthChange` - **optional** Called when the user selects a new month on the calendar. Passed a moment Date object representing the view date for the calendar, which can be used to determine the currently-showing month and year.

Note: Changing the view month does not change the selected date.

---
