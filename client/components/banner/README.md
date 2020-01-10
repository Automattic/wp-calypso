
Banner
===

This component renders a customizable banner.

## Usage

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

### Props


| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `callToAction` | `string` | null | Shows a CTA text. |
| `className` | `string` | null | Any additional CSS classes. |
| `compact` | `bool` | false | Display a compact version of the banner. |
| `description` | `string` | null | The banner description. |
| `disableHref` | `bool` | false | When true, prevent the Banner to be linked either via the `href` props or as a side effect of the `siteSlug` connected prop. |
| `dismissPreferenceName` | `bool` | false | The user preference name that we store a boolean against, prefixed with `dismissible-card-` to avoid namespace collisions. |
| `dismissTemporary` | `bool` | false | When true, clicking on the cross will dismiss the card for the current page load. |
| `event` | `string` | null | Event to distinguish the nudge in tracks. Used as <code>cta_name</code> event property. |
| `feature` | `string` | null | Slug of the feature to highlight in the plans compare card. |
| `href` | `string` | null | The component target URL. |
| `icon` | `string` or `bool` | null or false | The component icon. |
| `list` | `string` | null | A list of the upgrade features. |
| `onClick` | `string` | null | A function associated to the click on the whole banner or just the CTA or dismiss button. |
| `plan` | `string` | null | PlanSlug of the plan that upgrade leads to. |
| `price` | `string` | null | One or two (original/discounted) upgrade prices. |
| `title` | `string` | null | (required) The banner title. |

### General guidelines

* If `href` is not provided, `feature` can auto-generate it.
* If `callToAction` is provided, `href` and `onClick` are not applied to the whole banner, but to the `callToAction` button only.
* If `dismissPreferenceName` is provided, `href` is only applied if `callToAction` is provided.


