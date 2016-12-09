# Banner

This component renders a customizable banner.

## Props:

- *callToAction* - shows a CTA text.
- *className* - any additional CSS classes.
- *description* - the banner description.
- *dismissPreferenceName*: the user preference name that we store a boolean against, prefixed with 'dismissible-card-' to avoid namespace collisions.
- *dismissTemporary*: when true, clicking on the cross will dismiss the card for the current page load.
- *event* - event to distinguish the nudge in tracks. Used as `cta_name` event property.
- *feature* - slug of the feature to highlight in the plans compare card.
- *href* - the component target URL.
- *icon* - the component icon.
- *list* - a list of the upgrade features.
- *onClick* - a function associated to the click on the whole banner or just the CTA or dismiss button.
- *plan* - PlanSlug of the plan that upgrade leads to.
- *price* - one or two (original/discounted) upgrade prices.
- *title* - (required) the banner title.

If `href` is not provided, `feature` can auto-generate it.

If `callToAction` is provided, `href` and `onClick` are not applied to the whole banner, but to the `callToAction` button only.

If `dismissPreferenceName` is provided, `href` is only applied if `callToAction` is provided.

## Usage:

```js
import { PLAN_BUSINESS, FEATURE_ADVANCED_SEO } from 'lib/plans/constants';
import Banner from 'components/banner';

render() {
	return (
		<Banner
			callToAction="Upgrade now!"
			description="Obtain more features."
			dismissPreferenceName="example-banner"
			dismissTemporary={ true }
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
