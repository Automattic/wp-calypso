UpsellNudge (JSX)
===

`UpsellNudge` is a wrapper for the `Banner` component, used to display upsell nudges for plans, domains, services, and product features.

## Usage

```js
import UpsellNudge from 'blocks/upsell-nudge';

function myUpsell() {
	return (
		<UpsellNudge
			eventName={ 'calypso_domain_upsell_nudge' }
			buttonText={ translate( 'Upgrade' ) }
			text={ translate( 'Free domain with a plan!' ) }
			href={ '/plans' }
			isCompact
		/>
	)
}
```

### Props


Name | Type | Default | Description
---- | ---- | ---- | ----
`buttonText` | `string` | 'Upgrade' | Message to show on the upsell call to action.
`dismissPreferenceName` | `string` | empty | Enables a dismiss icon with this value as the event name
`eventName` | `string` | null | Unique event name for tracking the nudge, passed as a Tracks event property
`eventProperties` | `object` | null | Additional event properties to track
`href` | `string` | null | The URL/path that the user is taken to when clicked.
`icon` | `string` | null | Optional reference to a Gridicon.
`isCompact` | `bool` | false | Show a small version of the nudge. Best for places like the sidebar.
`text` | `string` | 'Free domain with a plan!' | Message to show on the upsell.
