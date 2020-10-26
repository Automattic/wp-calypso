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
import PlanStorageBar from 'calypso/blocks/plan-storage/bar';
import QueryMediaStorage from 'calypso/components/data/query-media-storage';
import { getMediaStorage } from 'calypso/state/sites/media-storage/selectors';

function render() {
	const planName = this.props.site.plan.product_name_short;
	return (
		<div>
			<QueryMediaStorage siteId={ this.props.siteId } />
			<PlanStorageBar sitePlanName={ planName } mediaStorage={ this.props.mediaStorage } />
		</div>
	);
}
//...
export default connect( ( state, ownProps ) => {
	return {
		mediaStorage: getMediaStorage( state, ownProps.siteId ),
	};
} )( MyComponent );
```

## Props

- `sitePlanName`: A plan name ( Free or Premium ) (required)
- `mediaStorage`: Media Storage limits for a given site. If this is not provided, the bar will not render.
- `className`: A string that adds additional class names to this component.
