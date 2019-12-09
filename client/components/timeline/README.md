Timeline
========

`Timeline` and `TimelineItem` are components used to render timelines.

## Usage

A `Timeline` expects its children to be a flat list of `TimelineItem`:

## `TimelineItem` props

### `date { Date }`

The date to show for the timeline item.

### `detail { string }`

The detail message to show below the date.

### `disabled { bool }`

Show the icon as disabled and disable the actionButton.

### `icon { string }`

The name of the gridicon to show in the TimelineItem.

### `iconHighlight { string }`

One of the following strings to indicate the highlight color of the icon: `success`, `info`, `warning`, `error`

### `actionLabel { string }`

The string to show on the Timeline button.

### `actionIsBusy { bool }`

Show the action button as busy.

### `actionIsDisabled { bool }`

Show the action button as disabled.

### `actionIsPrimary { bool }`

Show the action button as primary.

### `actionIsScary { bool }`

Show the action button as "scary."

### `onActionClick { function }`

The function to call when the action button is clicked.

---

```jsx
import Timeline from 'components/timeline';
import TimelineItem from "components/timeline/timeline-item";

export default class extends React.Component {
	// ...
	
	render() {
		return (
			<Timeline>
				<TimelineItem
					date={ new Date( "March 14, 2017" ) }
					detail="Domain registered and activated by John Doe"
					icon="checkmark"
					iconHighlight="success"
					actionLabel="Delete domain"
					onActionClick={ noop }
				/>
				<TimelineItem
					date={ new Date( "February 11, 2021" ) }
					detail="You have Auto-renew enabled which means your domain will automatically be newed for you every year."
					icon="sync"
					actionLabel="Disable Auto-renew"
					onActionClick={ noop }
				/>
				<TimelineItem
					date={ new Date( "March 14, 2021" ) }
					detail="Your domain will expire and your site will not be accessible from this URL any longer. You can renew any time or turn on auto-renew."
					icon="notice-outline"
					iconHighlight="warning"
					actionLabel="Enable Auto-renew"
					actionIsPrimary
					onActionClick={ noop }
				/>
				<TimelineItem
					date={ new Date( "April 28, 2021" ) }
					detail="Renewal grace period: You can still renew your expired domain at the standard rate during this period."
					icon="time"
					disabled
				/>
				<TimelineItem
					date={ new Date( "May 28, 2021" ) }
					detail="Redemption period: You can renew your expired domain with an extra fee of $80."
					icon="time"
					disabled
				/>
				<TimelineItem
					date={ new Date( "May 28, 2021" ) }
					detail="Your domain registration will be canceled and your domain will become publicly available for registration."
					icon="cross"
					disabled
				/>
				<TimelineItem
					date={ new Date( "May 28, 2021" ) }
					detail="Just an example of a timeline item with an error highlight."
					icon="cross"
					iconHighlight="error"
					actionLabel="Watch out!"
					actionIsScary
					actionIsPrimary
					onActionClick={ noop }
				/>
			</Timeline>
		);
	}

}
```
