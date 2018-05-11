# Banner

This component renders a customizable banner.

## Usage:

```jsx
import { PLAN_BUSINESS, FEATURE_ADVANCED_SEO } from 'lib/plans/constants';
import Banner from 'components/banner';

render() {
	return (
		<Banner
			callToAction="Upgrade now!"
			description="Obtain more features."
			disableHref
			dismissPreferenceName="example-banner"
			dismissTemporary
			event="track_event"
			feature={ FEATURE_ADVANCED_SEO }
			href="https://wordpress.com/"
			icon="star"
			list={ [ 'A feature', 'Another feature' ] }
			onClick={ someFunction }
			plan={ PLAN_BUSINESS }
			prices={ [ 10.99, 9.99 ] }
			title="Upgrade to a better plan!"
		/>
	);
}
```

## Props:

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Default</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>callToAction</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>Shows a CTA text.</td>
		</tr>
		<tr>
			<td><code>className</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>And additional CSS classes.</td>
		</tr>
		<tr>
			<td><code>description</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>The banner description.</td>
		</tr>
		<tr>
			<td><code>disableHref</code></td>
			<td><code>bool</code></td>
			<td></td>
			<td>When true, prevent the Banner to be linked either via the <code>href</code> props or as a side effect of the <code>siteSlug</code> connected prop.</td>
		</tr>
		<tr>
			<td><code>dismissPreferenceName</code></td>
			<td><code>bool</code></td>
			<td></td>
			<td>The user preference name that we store a boolean against, prefixed with <code>dismissible-card-</code> to avoid namespace collisions.</td>
		</tr>
		<tr>
			<td><code>dismissTemporary</code></td>
			<td><code>bool</code></td>
			<td></td>
			<td>When true, clicking on the cross will dismiss the card for the current page load.</td>
		</tr>
		<tr>
			<td><code>event</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>Event to distinguish the nudge in tracks. Used as <code>cta_name</code> event property.</td>
		</tr>
		<tr>
			<td><code>feature</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>Slug of the feature to highlight in the plans compare card.</td>
		</tr>
		<tr>
			<td><code>href</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>The component target URL.</td>
		</tr>
		<tr>
			<td><code>icon</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>The component icon.</td>
		</tr>
		<tr>
			<td><code>list</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>A list of the upgrade features.</td>
		</tr>
		<tr>
			<td><code>onClick</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>A function associated to the click on the whole banner or just the CTA or dismiss button.</td>
		</tr>
		<tr>
			<td><code>plan</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>PlanSlug of the plan that upgrade leads to.</td>
		</tr>
		<tr>
			<td><code>price</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>One or two (original/discounted) upgrade prices.</td>
		</tr>
		<tr>
			<td><code>title</code></td>
			<td><code>string</code></td>
			<td></td>
			<td>(required) The banner title.</td>
		</tr>
	</tbody>
</table>

If `href` is not provided, `feature` can auto-generate it.

If `callToAction` is provided, `href` and `onClick` are not applied to the whole banner, but to the `callToAction` button only.

If `dismissPreferenceName` is provided, `href` is only applied if `callToAction` is provided.


