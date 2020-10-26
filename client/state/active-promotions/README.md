# ActivePromotions

A module for managing activePromotions data.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### Action creators

> Action creators are exactly that—functions that create actions.

#### activePromotionsReceiveAction( activePromotions )

#### activePromotionsRequestSuccessAction()

#### activePromotionsRequestFailureAction( error )

#### requestActivePromotions()

```js
import {
	activePromotionsReceiveAction,
	activePromotionsRequestSuccessAction,
	activePromotionsRequestFailureAction,
	requestActivePromotions,
} from 'calypso/state/activePromotions/actions';

dispatch( requestActivePromotions() );

wpcom
	.activePromotions()
	.list()
	.then( ( response ) => {
		dispatch( activePromotionsRequestSuccessAction() );
		dispatch( activePromotionsReceiveAction( response ) );
	} )
	.catch( ( error ) => {
		dispatch( activePromotionsRequestFailureAction( error.message ) );
	} );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `activePromotions`, with the following structure:

```js
state.activePromotions = {
	items: [ 'spring_sale' ],

	requesting: false,

	errors: false,
};
```
