# Banner

This component renders a customizable banner.

## Props:

- *callToAction* - shows a CTA text.
- *description* - the banner description.
- *event* - event to distinguish the nudge in tracks. Used as `cta_name` event property.
- *feature* - slug of the feature to highlight in the plans compare card.
- *href* - the component target URL.
- *icon* - the component icon.
- *list* - a list of the upgrade features.
- *plan* - PlanSlug of the plan that upgrade leads to.
- *title* - (required) the banner title.

## Usage:

```js
import { PLAN_BUSINESS, FEATURE_ADVANCED_SEO } from 'lib/plans/constants';
import Banner from 'components/banner';

render() {
	return (
		<Banner
			callToAction="Upgrade now!"
			color="#f0b849"
			description="Obtain more features."
			event="track_event"
			feature={ FEATURE_ADVANCED_SEO }
			href="https://wordpress.com/"
			icon="star"
			list={ [ 'A feature', 'Another feature' ] }
			plan={ PLAN_BUSINESS }
			title="Upgrade to a better plan!"
		/>
	);
}
```
