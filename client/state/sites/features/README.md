# Site Features

A module for managing site features data, populating the state with the features subtree, specifically in the `state.sites.features` path.
In the end, the subtree data is provided by the features endpoint of the WP COM REST API. The following is an example of how it looks:

```
192998870: {
	data: {
		active: [
			'akismet',
			'send-a-message',
			'whatsapp-button',
			'social-previews',
			// ...
		],
		available: {
			calendly: [
				'value_bundle',
				'business-bundle',
				'ecommerce-bundle',
				'value_bundle-2y',
				'business-bundle-2y',
				'ecommerce-bundle-2y',
				'value_bundle_monthly',
				'business-bundle-monthly',
				'ecommerce-bundle-monthly',
			],
			'core/audio': [
				'personal-bundle',
				'value_bundle',
				'business-bundle',
				'ecommerce-bundle',
				'personal-bundle-2y',
				'value_bundle-2y',
				'business-bundle-2y',
				'ecommerce-bundle-2y',
				'personal-bundle-monthly',
				'value_bundle_monthly',
				'business-bundle-monthly',
				'ecommerce-bundle-monthly'
			],
			// ...
		}
	},
}
```

Since these data are defined and provided by the server-side, we can rely on what feature is enabled and what is not, and update the UI interface accordingly. For this purpose is why we created the [hasActiveSiteFeature()](../../selectors/has-active-site-feature.js) selector.

```es6
import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';

import hasActiveSiteFeature from 'calypso/state/selectors/has-active-site-feature';

const MyComponent = ( { canSetPrimaryDomain } ) {
	return (
		<div>
			{ `It is ${ canSetPrimaryDomain ? '' : 'not' } possible to set the primary domain` }
		</div>
	);
}

export default connect(
	( state, ownProps ) => {
		const siteId = get( ownProps, 'selectedSite.ID', null );

		return {
			canSetPrimaryDomain: hasActiveSiteFeature( state, siteId, FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ),
		};
	}
)( MyComponent ) );
```

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchSiteFeatures( siteId: Number )`

Fetches features for the site with the given site ID.

### `fetchSiteFeaturesCompleted( siteId: Number, data: Object )`

Adds the features fetched from the API to the set of features for the given site ID.

```js
import {
	fetchSiteFeatures,
	fetchSiteFeaturesCompleted,
} from 'calypso/state/sites/features/actions';

dispatch( fetchSiteFeatures( 555555555 ) );
dispatch(
	fetchSiteFeaturesCompleted( 555555555, {
		active: {
			/*...*/
		},
		available: {
			/*...*/
		},
	} )
);
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `sites.features`.
