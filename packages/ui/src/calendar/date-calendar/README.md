# `DateCalendar`

`DateCalendar` is a React component that provides a customizable calendar interface for **single date** selection.

The component is built with accessibility in mind and follows ARIA best practices for calendar widgets. It provides keyboard navigation, screen reader support, and customizable labels for internationalization.

## Usage example

```tsx
import { DateCalendar } from '@automattic/components';

function MyComponent() {
	const [ selected, setSelected ] = useState< Date >( new Date() );

	return <DateCalendar selected={ selected } onSelect={ setSelected } />;
}
```

## Props

These props are shared between both single date and date range calendar modes.

### `required`

- Type: `boolean`
- Required: No
- Default: `false`

Whether the selection is required. When `true`, there always needs to be a date selected.

### `selected`

- Type: `Date | undefined | null`
- Required: No

The selected date.

### `onSelect`

- Type: `(selected: Date | undefined, triggerDate: Date, modifiers: Modifiers, e: React.MouseEvent | React.KeyboardEvent) => void`
- Required: No

Event handler when a day is selected.

### `defaultSelected`

- Type: `Date`
- Required: No

The default selected date (for uncontrolled usage).

### `defaultMonth`

- Type: `Date`
- Required: No
- Default: Current month

The initial month to show in the calendar view (uncontrolled).

### `month`

- Type: `Date`
- Required: No

The month displayed in the calendar view (controlled). Use together with `onMonthChange` to change the month programmatically.

### `numberOfMonths`

- Type: `number`
- Required: No
- Default: `1`

The number of months displayed at once.

### `startMonth`

- Type: `Date`
- Required: No

The earliest month to start the month navigation.

### `endMonth`

- Type: `Date`
- Required: No

The latest month to end the month navigation.

### `autoFocus`

- Type: `boolean`
- Required: No

Focus the first selected day (if set) or today's date (if not disabled). Use this prop when you need to focus the calendar after a user action (e.g. opening the dialog with the calendar).

### `disabled`

- Type: `Matcher | Matcher[] | undefined`
- Required: No

Specify which days are disabled. Using `true` will disable all dates. See the [Matcher Types](#matcher-types) section for more details.

### `disableNavigation`

- Type: `boolean`
- Required: No

Disable the navigation buttons.

### `labels`

- Type: `object`
- Required: No

Use custom labels for internationalization. All labels are optional and have sensible defaults:

```typescript
{
  labelNav?: () => string; // Navigation toolbar label
  labelGrid?: (date: Date) => string; // Month grid label (default: "LLLL y")
  labelGridcell?: (date: Date, modifiers?: Modifiers) => string; // Grid cell label
  labelNext?: (month: Date | undefined) => string; // Next month button label
  labelPrevious?: (month: Date | undefined) => string; // Previous month button label
  labelDayButton?: (date: Date, modifiers?: Modifiers) => string; // Day button label
  labelWeekday?: (date: Date) => string; // Weekday label
}
```

**Important: For a correct localized experience, consumers should make sure the locale used for the translated labels and `locale` prop are consistent.**

### `locale`

- Type: `Locale`
- Required: No
- Default: `enUS` from `@date-fns/locale`

The locale object used to localize dates. Pass a locale from `@date-fns/locale` to localize the calendar.

**Important: For a correct localized experience, consumers should make sure the locale used for the translated labels and `locale` prop are consistent.**

### `weekStartsOn`

- Type: `0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined`
- Required: No
- Default: Based on the `locale` prop

The index of the first day of the week (0 - Sunday). Overrides the locale's setting.

### `onMonthChange`

- Type: `(month: Date) => void`
- Required: No

Event fired when the user navigates between months.

### `timeZone`

- Type: `string`
- Required: No

The time zone (IANA or UTC offset) to use in the calendar. See [Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for possible values.

When working with time zones, use the `TZDate` object exported by this package instead of the native `Date` object.

```tsx
import { DateCalendar, TZDate } from '@automattic/components';

export function WithTimeZone() {
	const timeZone = 'America/New_York';
	const [ selected, setSelected ] = useState< Date | undefined >(
		new TZDate( 2024, 12, 10, timeZone ) // Use `TZDate` instead of `Date`
	);
	return <DateCalendar timeZone={ timeZone } selected={ selected } onSelect={ setSelected } />;
}
```

### `role`

- Type: `'application' | 'dialog' | undefined`
- Required: No
- Default: `'application'`

The role attribute to add to the container element.

## Matcher Types

The calendar component uses a flexible matching system to determine which days should be disabled or have specific modifiers. Here are the available matcher types:

### Boolean Matcher

```typescript
const booleanMatcher: Matcher = true; // Will always match the day
```

### Date Matcher

```typescript
const dateMatcher: Matcher = new Date(); // Will match today's date
```

### Array Matcher

```typescript
const arrayMatcher: Matcher = [ new Date( 2019, 1, 2 ), new Date( 2019, 1, 4 ) ]; // Will match the days in the array
```

### Date After Matcher

```typescript
const afterMatcher: DateAfter = { after: new Date( 2019, 1, 2 ) }; // Will match days after the 2nd of February 2019
```

### Date Before Matcher

```typescript
const beforeMatcher: DateBefore = { before: new Date( 2019, 1, 2 ) }; // Will match days before the 2nd of February 2019
```

### Date Interval Matcher

```typescript
const intervalMatcher: DateInterval = {
	after: new Date( 2019, 1, 2 ),
	before: new Date( 2019, 1, 5 ),
}; // Will match the days between the 2nd and the 5th of February 2019 (exclusive)
```

### Date Range Matcher

```typescript
const rangeMatcher: DateRange = {
	from: new Date( 2019, 1, 2 ),
	to: new Date( 2019, 1, 5 ),
}; // Will match the days between the 2nd and the 5th of February 2019 (inclusive)
```

### Day of Week Matcher

```typescript
const dayOfWeekMatcher: DayOfWeek = { dayOfWeek: 0 }; // Will match Sundays
const weekendMatcher: DayOfWeek = { dayOfWeek: [ 0, 6 ] }; // Will match weekends
```

### Function Matcher

```typescript
const functionMatcher: Matcher = ( day: Date ) => {
	return day.getMonth() === 2; // Will match when month is March
};
```
