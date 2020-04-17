UpsellNudge (JSX)
===

`UpsellNudge` is a wrapper for the `Banner` component, used to display upsell nudges for plans, domains, services, and product features.

## Usage

```js
import UpsellNudge from 'blocks/upsell-nudge';

function myUpsell() {
	return (
		<UpsellNudge
			tracksImpressionName={ 'calypso_domain_upsell_nudge' }
			callToAction={ translate( 'Upgrade' ) }
			title={ translate( 'Free domain with a plan!' ) }
			href={ '/plans' }
			showIcon={ true }
			compact
		/>
	)
}
```

### Props


Name | Type | Default | Description
---- | ---- | ---- | ----
`callToAction` | `string` | null | Message to show on the upsell call to action.
`compact` | `bool` | false | Show a small version of the nudge. Best for places like the sidebar.
`disableHref` | `bool` | false | Ensure the nudge doesn't link to anywhere. Ideal for nudges shown to non-admins.
`dismissPreferenceName` | `string` | empty | Enables dismiss functionality, using this value as the dismiss event name.
`href` | `string` | null | The URL/path that the user is taken to when clicked.
`icon` | `string` | null | Optional reference to a Gridicon.
`showIcon` | `bool` | `false` | Show an icon next to the title.
`title` | `string` | null | Message to show on the upsell.
`tracksImpressionName` | `string` | | Unique event name to track when the nudge is viewed
`tracksClickName` | `string` | | Unique event name to track when the nudge is clicked
`tracksDismissName` | `string` |  | Unique event name to track when the nudge is dismissed
`tracksImpressionProperties` | `object` | | Additional props to track when the nudge is viewed
`tracksClickProperties` | `object` | | Additional props to track when the nudge is clicked
`tracksDismissProperties` | `object` |  | Additional props to track when the nudge is dismissed
