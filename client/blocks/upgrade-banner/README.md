# Upgrade Banner

This component renders a customizable upgrade banner.

## Props:

- *button* - renders the component as a button.
- *callToAction* - shows a CTA text.
- *callToActionButton* - renders the CTA as a button.
- *color* - changes the accent color.
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
import UpgradeBanner from 'blocks/upgrade-banner';

render() {
	return (
		<UpgradeBanner
			button={ false }
			callToAction="Upgrade now!"
			callToActionButton={ false }
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
