# Plan Storage

This component is used to display the remaining media storage limits. Using PlanStorage
will query media storage limits for you.

## Usage

```javascript
<PlanStorage siteId={ this.props.siteId } />;
```

## Props

- `siteId`: A site ID (required)
- `className`: A string that adds additional class names to this component.

You can also use PlanStorageBar directly if you need more control over when
media storage limits are fetched.

## Usage

```javascript
import { Site } from '@automattic/data-stores';
import PlanStorageBar from 'calypso/blocks/plan-storage/bar';

function MyComponent( { site, siteId } ) {
	const planName = site.plan.product_name_short;
	const { data: mediaStorage } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );

	return <PlanStorageBar sitePlanName={ planName } mediaStorage={ this.props.mediaStorage } />;
}
//...
export default MyComponent;
```

## Props

- `sitePlanName`: A plan name ( Free or Premium ) (required)
- `mediaStorage`: Media Storage limits for a given site. If this is not provided, the bar will not render.
- `className`: A string that adds additional class names to this component.
