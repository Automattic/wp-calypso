# Calendar

The Calendar component provides a date picker interface that allows users to select dates from a monthly calendar view.

## Usage

```jsx
import { Calendar } from '@automattic/components';
import { useState } from '@wordpress/element';

function MyCalendar() {
	const [ date, setDate ] = useState( new Date() );

	return (
		<Calendar
			currentDate={ date }
			onChange={ ( newDate ) => setDate( newDate ) }
		/>
	);
}
```

## Props

### currentDate

The current date and time at initialization. This determines which date is selected when the calendar is first rendered.

-   Type: `Date | string | number | null`
-   Required: No
-   Default: `undefined`

If a string is provided, it will be converted to a Date object. If `null` is provided, no date will be selected initially.

### onChange

The function called when a new date has been selected. It is passed the date as a string in the format "yyyy-MM-dd'T'HH:mm:ss".

-   Type: `( date: string ) => void`
-   Required: No
-   Default: `undefined`

### isInvalidDate

A callback function which receives a Date object representing a day as an argument, and should return a Boolean to signify if the day is valid or not. Invalid dates are visually distinguished and cannot be selected.

-   Type: `( date: Date ) => boolean`
-   Required: No
-   Default: `undefined`

```jsx
// Example: Disable weekend selection
<Calendar
	isInvalidDate={ ( date ) => {
		const day = date.getDay();
		return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
	} }
/>
```

### onMonthPreviewed

A callback invoked when selecting the previous/next month in the date picker. The callback receives the new month date in the ISO format as an argument.

-   Type: `( date: string ) => void`
-   Required: No
-   Default: `undefined`

### startOfWeek

The day that the week should start on. 0 for Sunday, 1 for Monday, etc.

-   Type: `0 | 1 | 2 | 3 | 4 | 5 | 6`
-   Required: No
-   Default: `0` (Sunday)

## Features

- Month navigation with previous/next buttons
- Keyboard navigation support for accessibility
- Support for marking specific dates as invalid
- Customizable week start day
- Internationalization support via WordPress i18n

## Accessibility

The Calendar component implements keyboard navigation following ARIA best practices:

- Arrow keys navigate between days
- Page Up/Down keys navigate between months
- Home/End keys navigate to the start/end of a week
- Selected dates are announced to screen readers
- Today's date is visually distinguished and announced
- Invalid dates are visually distinguished and announced

## Technical Implementation

The Calendar component uses the `useLilius` hook internally to manage the calendar state and date operations. It leverages the `date-fns` library for date manipulation and formatting.
