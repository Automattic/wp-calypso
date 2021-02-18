# Calendar Button

This component is used to display a calendar button. When it pressed, it shows a Popover with a calendar inside.

## Usage

```jsx
import CalendarButton from 'calypso/blocks/calendar-button';

function render() {
	return <CalendarButton />;
}
```

## Props

### `children`

<table>
	<tr><td>Type</td><td>Element</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

### `icon`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td>calendar</td></tr>
</table>

If the component doesn't have children elements then an icon (Gridicon) will be rendered inside of this one.

### `popoverPosition`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td>bottom</td></tr>
</table>

It defines the position of the Popover once it shows. This value is propagated to the `<Popover />` instance through of the `position` property.

### `type`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
	<tr><td>Default</td><td>button</td></tr>
</table>

This property defines to this component as a `button`. You shouldn't change this it.

### Props propagated to the `<Popover />`

- `autoPosition`
- `closeOnEsc`
- `events`
- `ignoreContext`
- `isVisible`
- `selectedDay`
- `showDelay`
- `siteId`

- `onClose`
- `onDateChange`
- `onMonthChange`
- `onShow`

### Props propagated to the `<CalendarPopover />`

- `selectedDay`: the date which will be shown initially
- `siteId`: Passing siteId the calendar will try to get values related with time zone.
- `onDateChange`: Function to be executed when the user selects a date.

## Examples

### As much simple as possible

```jsx
import CalendarButton from 'calypso/blocks/calendar-button';

function render() {
	const tomorrow = new Date( new Date().getTime() + 24 * 60 * 60 * 1000 );

	return <CalendarButton selectedDay={ tomorrow } onDateChange={ this.setDate } />;
}
```

### Custom calendar icon

```jsx
import CalendarButton from 'calypso/blocks/calendar-button';

function render() {
	return <CalendarButton icon="thumbs-up" />;
}
```

### Render using children property

```jsx
import CalendarButton from 'calypso/blocks/calendar-button';

function render() {
	return (
		<CalendarButton onDateChange={ this.setDate }>
			<a class="custom-content" href="https://wordpress.com">
				Open Me!
			</a>
		</CalendarButton>
	);
}
```
