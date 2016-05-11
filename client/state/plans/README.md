Plans
=====

A module for managing plans data.

# Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchWordPressPlans()`

Fetches plans


## Action creators

> Action creators are exactly that—functions that create actions.

### plansReceiveAction( plans )

### plansRequestAction()

### plansRequestSuccessAction()

### plansRequestFailureAction( error )

### plansSerializeAction()

### plansDeserializeAction()

```es6
import {
	plansReceiveAction,
	plansRequestAction,
	plansRequestSuccessAction,
	plansRequestFailureAction
} from 'state/plans/actions';

dispatch( plansRequestAction() );

wpcom
.plans()
.list()
	.then( response => {
		dispatch( plansRequestSuccessAction() );
		dispatch( plansReceiveAction( response ) );
	} )
	.catch( error => {
		dispatch( plansRequestFailureAction( error.message );
	}
```

# Reducer
Data from the aforementioned actions is added to the global state tree, under `plans`, with the following structure:

```js
state.plans = {
	items: [
		{
			product_id: 1,
			product_name: 'WordPress.com Free',
			product_name_en: 'Free',
			prices: { USD: 0, AUD: 0, CAD: 0, EUR: 0, GBP: 0, JPY: 0 },
			product_name_short: 'Free',
			product_slug: 'free_plan',
			tagline: 'Just get started',
			shortdesc: 'Get a free blog and be on your way to publishing your first post in less than five minutes.',
			description: 'Just start blogging: get a free blog and be on your way to publishing your first post in less than five minutes.',
			icon: 'https://s0.wordpress.com/i/store/plan-free.png',
			icon_active: 'https://s0.wordpress.com/i/store/plan-free-active.png',
			capability: 'manage_options',
			cost: 0,
			apple_sku: '',
			android_sku: '',
			bill_period: -1,
			product_type: 'bundle',
			available: 'yes',
			store: 0,
			features_highlight: [
				{
					items: [
						'free-blog',
						'space',
						'support'
					]
				}
			],
			bill_period_label: 'for life',
			price: '$0',
			formatted_price: '$0',
			raw_price: 0
		}
	],
	
	requesting: false,

	errors: false
}
```
