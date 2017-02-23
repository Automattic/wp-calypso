Plan Storage
==============

This component is used to display the remaining media storage limits. Using PlanStorage
will query media storage limits for you. 

#### Usage:

```javascript
	<PlanStorage
		siteId={ this.props.siteId }
		onClick={ this.onClickHandler } 
	/>
}
```

#### Props

* `siteId`: A site ID (required)
* `onClick`: An on click handler that is fired when the plan button is clicked.
* `className`: A string that adds additional class names to this component.


You can also use PlanStorageButton directly if you need more control over when
media storage limits are fetched.

#### Usage:

```javascript
import PlanStorageButton from 'blocks/plan-storage/bar';
import QueryMediaStorage from 'components/data/query-media-storage';
import { getMediaStorage } from 'state/sites/media-storage/selectors';

render() {
	const planName = this.props.site.plan.product_name_short;
	return (
		<div>
			<QueryMediaStorage siteId={ this.props.siteId } />
			<PlanStorageButton
				sitePlanName={ planName }
				mediaStorage={ this.props.mediaStorage }
				onClick={ this.onClickHandler }
			/>
		</div>
	);
}
//...
export default connect( ( state, ownProps ) => {
	return {
		mediaStorage: getMediaStorage( state, ownProps.siteId )
	};
} )( MyComponent );
```

#### Props

* `sitePlanName`: A plan name ( Free or Premium ) (required)
* `mediaStorage`: Media Storage limits for a given site. If this is not provided, the button will not render.
* `onClick`: An on click handler that is fired when the plan storage button is clicked.
* `className`: A string that adds additional class names to this component.



