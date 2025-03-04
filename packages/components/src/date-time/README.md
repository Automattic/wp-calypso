# DateTimePicker

DateTimePicker is a React component that renders a calendar and clock for date and time selection. The calendar and clock components can be accessed individually using the `DatePicker` and `TimePicker` components respectively.

![Date Time component](https://wordpress.org/gutenberg/files/2019/07/date-time-picker.png)

## Best practices

Date pickers should:

-   Use smart defaults and highlight the current date.

## Usage

Render a DateTimePicker.

```jsx
import { useState } from 'react';
import { DateTimePicker } from '@wordpress/components';

const MyDateTimePicker = () => {
	const [ date, setDate ] = useState( new Date() );

	return (
		<DateTimePicker
			currentDate={ date }
			onChange={ ( newDate ) => setDate( newDate ) }
			is12Hour={ true }
		/>
	);
};
```

## Props

The component accepts the following props:

### `currentDate`: `Date | string | number | null`

The current date and time at initialization. Optionally pass in a `null` value to specify no date is currently selected.

-   Required: No
-   Default: today's date

### `onChange`: `( date: string | null ) => void`

The function called when a new date or time has been selected. It is passed the `currentDate` as an argument.

-   Required: No

### `is12Hour`: `boolean`

Whether we use a 12-hour clock. With a 12-hour clock, an AM/PM widget is displayed and the time format is assumed to be `MM-DD-YYYY` (as opposed to the default format `DD-MM-YYYY`).

-   Type: `bool`
-   Required: No
-   Default: false

### `dateOrder`: `'dmy' | 'mdy' | 'ymd'`

The order of day, month, and year. This prop overrides the time format determined by `is12Hour` prop.

-   Type: `string`
-   Required: No
-   Default: `'dmy'`

### `isInvalidDate`: `( date: Date ) => boolean`

A callback function which receives a Date object representing a day as an argument, and should return a Boolean to signify if the day is valid or not.

-   Required: No

### `onMonthPreviewed`: `( date: Date ) => void`

A callback invoked when selecting the previous/next month in the date picker. The callback receives the new month date in the ISO format as an argument.

-   Required: No

### `events`: `{ date: Date }[]`

List of events to show in the date picker. Each event will appear as a dot on the day of the event.

-   Type: `Array`
-   Required: No

### `startOfWeek`: `number`

The day that the week should start on. 0 for Sunday, 1 for Monday, etc.

- Required: No
- Default: 0
