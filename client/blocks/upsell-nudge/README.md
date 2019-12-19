UpsellNudge (JSX)
===

`UpsellNudge` is used to display upsell nudges for plans, domains, services, and product features.

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
			showDismiss
		/>
	)
}
```

### Props


Name | Type | Default | Description
---- | ---- | ---- | ----
`href` | `string` | null | The URL/path that the user is taken to when clicked.
`onClick` | `func` | | Optional function to call when the action is clicked.
`icon` | `string` | null | Optional reference to a Gridicon.
`isCompact` | `bool` | false | Show a small version of the nudge. Best for places like the sidebar.
`buttonText` | `string` | 'Upgrade' | Message to show on the upsell call to action.
`text` | `string` | 'Free domain with a plan!' | Message to show on the upsell.
`eventName` | `string` | null | Unique event name for tracking the nudge, passed as a Tracks event property
`onDismissClick` | `func` |  | Optional function to run when showDismiss is true and the upsell is dismissed
`showDismiss` | `bool` | false | Allow the upsell to be dismissed
`eventProperties` | `object` | null | Additional event properties to track
