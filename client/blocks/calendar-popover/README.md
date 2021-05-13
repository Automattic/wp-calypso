# Calendar Popover

This component shows a Popover with a calendar inside.

Beyond combining Popover and PostSchedule, this component connects with the state-tree, so in this way timezone data related to the site configuration is propagated automatically.

## Usage

```jsx
import { Button } from '@automattic/components';
import CalendarPopover from 'calypso/blocks/calendar-popover';

const toggle = () => this.setState( { show: ! this.state.show } );
const buttonRef = React.createRef();

function render() {
	return (
		<div>
			<Button ref={ buttonRef } onClick={ this.toggle }>
				Show Popover
			</Button>

			<CalendarPopover context={ buttonRef } isVisible={ this.state.show } />
		</div>
	);
}
```

## Props

The following props can be passed to the CalendarPopover component:

### `children`

<table>
	<tr><td>Type</td><td>Element</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

#### Connect Props

### `gmtOffset`

<table>
	<tr><td>Type</td><td>Number</td></tr>
</table>

The site's UTC offset.

### `timezoneValue`

<table>
	<tr><td>Type</td><td>String</td></tr>
</table>

The site's timezone value, in the format of 'America/Araguaina (see <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>).

#### Props propagated to the `<Popover />`

- `autoPosition`
- `closeOnEsc`
- `ignoreContext`
- `isVisible`
- `position`
- `showDelay`
- `onClose`
- `onShow`

#### Props propagated to the `<PostSchedule />`

- `events`
- `selectedDay`
- `siteId`
- `onDateChange`
- `onMonthChange`
