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
			compact
		/>
	)
}
```

### Props


Name | Type | Default | Description
---- | ---- | ---- | ----
`buttonText` | `string` | null | Message to show on the upsell call to action.
`compact` | `bool` | false | Show a small version of the nudge. Best for places like the sidebar.
`dismissPreferenceName` | `string` | empty | Enables dismiss functionality with this value as the event name
`eventName` | `string` | null | Unique event name for tracking the nudge on impression, click, and dismiss, passed to `Banner` as a Tracks event property `cta_name`
`eventProperties` | `object` | null | Additional event properties to track on click
`href` | `string` | null | The URL/path that the user is taken to when clicked.
`icon` | `string` | null | Optional reference to a Gridicon.
`text` | `string` | null | Message to show on the upsell.
`tracksEvent` | `string` | `calypso_upsell_nudge_click` | Unique event name to track when the nudge is clicked
