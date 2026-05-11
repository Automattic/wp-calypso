# DatePicker

React component used to display a Date Picker.

---

## Example Usage

```jsx
import { Component } from 'react';
import DatePicker from 'calypso/components/date-picker';

export default class DatePickerExample extends Component {
	// ...

	onSelectDay( date ) {
		this.setState( { date: date } );
	}

	render() {
		const events = [
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
			},
		];

		return (
			<DatePicker
				calendarInitialDate={ new Date( '2015-07-01' ) }
				events={ events }
				onSelectDay={ this.onSelectDay }
				selectedDay={ this.state.date }
			/>
		);
	}
}
```

---

## DatePicker

### Props

`calendarInitialDate` - **optional** Date object that defines the month of the calendar at first render. Default is `now`.

`calendarViewDate` - **optional** Controlled month being displayed. Use with `onMonthChange`.

`selectedDay` - **optional** Date object to select the current day.

`timeReference` - **optional** Moment instance used to adjust the time when a day is selected.

`events` - **optional** Array of events. Each event needs a `date` property; optional `title`, `id`, `icon`, `socialIcon`, `socialIconColor` are used by the events tooltip.

`onSelectDay` - **optional** Called when day is selected by user.

`onMonthChange` - **optional** Called when month is changed by user.

`disabledDays` - **optional** Array of [react-day-picker v9 matchers](https://daypicker.dev/api/type-aliases/Matcher).

`modifiers` - **optional** Custom day modifiers, mapped through `modifiersClassNames` to `DayPicker-Day--<name>` classes.

`useArrowNavigation` - **optional** Render WordPress chevron arrows in the nav bar instead of month-name labels.

`formatMonthTitle` - **optional** Override the calendar caption format. Receives a `Date`, returns a string. Pass `() => ''` to hide the caption (used by `post-schedule`, which renders its own header).

---
