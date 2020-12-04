# Domain to Plan Nudge

This is an upgrade nudge that targets users with a site that has a free plan
and a paid domain.

## How to use

```js
import DomainToPlanNudge from 'calypso/blocks/domain-to-plan-nudge';

function render() {
	return (
		<div className="your-stuff">
			<DomainToPlanNudge />
		</div>
	);
}
```

## Props

Below is a list of supported props.

### `siteId`

<table>
	<tr><td>Type</td><td>Number</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>selected site</code></td></tr>
</table>

Check for the requirements above using this siteId,
otherwise we default to the currently selected site.
