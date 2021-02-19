# Timeline

`Timeline` and `TimelineEvent` are components used to render timelines.

## Usage

A `Timeline` expects its children to be a flat list of `TimelineEvent`:

## `TimelineEvent` props

### `date { Date }`

The date to show for the timeline item.

### `dateFormat { string }`

The format for the dates shown in the timeline.

### `detail { string }`

The detail message to show below the date.

### `disabled { bool }`

Show the icon as disabled and disable the actionButton.

### `icon { string }`

The name of the gridicon to show in the TimelineEvent.

### `iconBackground { string }`

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
import Timeline from 'calypso/components/timeline';
import TimelineEvent from 'calypso/components/timeline/timeline-item';

export default class extends React.Component {
	// ...

	render() {
		return (
			<Timeline>
				<TimelineEvent
					date={ new Date( '14 March 2017' ) }
					detail="Domain registered and activated by Jane Doe."
					icon="checkmark"
					iconBackground="success"
					actionLabel="Delete domain"
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( '11 February 2021' ) }
					detail="You have Auto-renew enabled which means your domain will automatically be renewed for you every year."
					icon="sync"
					actionLabel="Disable Auto-renew"
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( '14 March 2021' ) }
					detail="Your domain will expire and your site will not be accessible from this URL any longer. You can renew any time or turn on auto-renew."
					icon="notice-outline"
					iconBackground="warning"
					actionLabel="Enable Auto-renew"
					actionIsPrimary
					onActionClick={ noop }
				/>
				<TimelineEvent
					date={ new Date( '18 April 2021' ) }
					detail="Renewal grace period: You can still renew your expired domain at the standard rate during this period."
					icon="time"
					disabled
				/>
				<TimelineEvent
					date={ new Date( '28 May 2021' ) }
					detail="Redemption period: You can renew your expired domain with an extra fee of $80."
					icon="time"
					disabled
				/>
				<TimelineEvent
					date={ new Date( '28 May 2021' ) }
					detail="Your domain registration will be canceled and your domain will become publicly available for registration."
					icon="cross"
					disabled
				/>
				<TimelineEvent
					date={ new Date( '28 May 2021' ) }
					detail="Just an example of a timeline event with an error icon highlight and a scary action."
					icon="cross"
					iconBackground="error"
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
