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
			androidSku: '',
			appleSku: '',
			available: 'yes',
			billPeriod: -1,
			billPeriodLabel: 'for life',
			cost: 0,
			capability: 'manage_options',
			description: 'Just start blogging: get a free blog and be on your way to publishing your first post in less than five minutes.',
			featuresHighlight: [Object],
			formattedPrice: '$0',
			icon: 'https://s0.wordpress.com/i/store/plan-free.png',
			iconActive: 'https://s0.wordpress.com/i/store/plan-free-active.png',
			price: '$0',
			prices: [Object],
			productId: 1,
			productName: 'WordPress.com Free',
			productNameEn: 'Free',
			productNameShort: 'Free',
			productSlug: 'free_plan',
			productType: 'bundle',
			rawPrice: 0,
			shortdesc: 'Get a free blog and be on your way to publishing your first post in less than five minutes.',
			store: 0,
			tagline: 'Just get started'
		}
	],
	
	requesting: false,

	errors: false
}
```
