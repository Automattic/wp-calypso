# @wordpress/data

WordPress' data module serves as a hub to manage application state for both plugins and WordPress itself, providing tools to manage data within and between distinct modules. It is designed as a modular pattern for organizing and sharing data: simple enough to satisfy the needs of a small plugin, while scalable to serve the requirements of a complex single-page application.

The data module is built upon and shares many of the same core principles of [Redux](https://redux.js.org/), but shouldn't be mistaken as merely _Redux for WordPress_, as it includes a few of its own [distinguishing characteristics](#comparison-with-redux). As you read through this guide, you may find it useful to reference the Redux documentation — particularly [its glossary](https://redux.js.org/glossary) — for more detail on core concepts.

## Installation

Install the module

```bash
npm install @wordpress/data --save
```

## Registering a Store

Use the `registerStore` function to add your own store to the centralized data registry. This function accepts two arguments: a name to identify the module, and an object with values describing how your state is represented, modified, and accessed. At a minimum, you must provide a reducer function describing the shape of your state and how it changes in response to actions dispatched to the store.

```js
const { data, apiRequest } = wp;
const { registerStore, dispatch } = data;

const DEFAULT_STATE = {
	prices: {},
	discountPercent: 0,
};

registerStore( 'my-shop', {
	reducer( state = DEFAULT_STATE, action ) {
		switch ( action.type ) {
			case 'SET_PRICE':
				return {
					...state,
					prices: {
						...state.prices,
						[ action.item ]: action.price,
					},
				};

			case 'START_SALE':
				return {
					...state,
					discountPercent: action.discountPercent,
				};
		}

		return state;
	},

	actions: {
		setPrice( item, price ) {
			return {
				type: 'SET_PRICE',
				item,
				price,
			};
		},
		startSale( discountPercent ) {
			return {
				type: 'START_SALE',
				discountPercent,
			};
		},
	},

	selectors: {
		getPrice( state, item ) {
			const { prices, discountPercent } = state;
			const price = prices[ item ];

			return price * ( 1 - ( 0.01 * discountPercent ) );
		},
	},

	resolvers: {
		async getPrice( state, item ) {
			const price = await apiRequest( { path: '/wp/v2/prices/' + item } );
			dispatch( 'my-shop' ).setPrice( item, price );
		},
	},
} );
```

A [**reducer**](https://redux.js.org/docs/basics/Reducers.html) is a function accepting the previous `state` and `action` as arguments and returns an updated `state` value.

The **`actions`** object should describe all [action creators](https://redux.js.org/glossary#action-creator) available for your store. An action creator is a function that optionally accepts arguments and returns an action object to dispatch to the registered reducer. _Dispatching actions is the primary mechanism for making changes to your state._

The **`selectors`** object includes a set of functions for accessing and deriving state values. A selector is a function which accepts state and optional arguments and returns some value from state. _Calling selectors is the primary mechanism for retrieving data from your state_, and serve as a useful abstraction over the raw data which is typically more susceptible to change and less readily usable as a [normalized object](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape#designing-a-normalized-state).

The return value of `registerStore` is a [Redux-like store object](https://redux.js.org/docs/basics/Store.html) with the following methods:

- `store.getState()`: Returns the state value of the registered reducer
   - _Redux parallel:_ [`getState`](https://redux.js.org/api-reference/store#getState)
- `store.subscribe( listener: Function )`: Registers a function called any time the value of state changes.
   - _Redux parallel:_ [`subscribe`](https://redux.js.org/api-reference/store#subscribe(listener))
- `store.dispatch( action: Object )`: Given an action object, calls the registered reducer and updates the state value.
   - _Redux parallel:_ [`dispatch`](https://redux.js.org/api-reference/store#dispatch(action))

## Data Access and Manipulation

It is very rare that you should access store methods directly. Instead, the following suite of functions and higher-order components is provided for the most common data access and manipulation needs.

### Data API

The top-level API of `@wordpress/data` includes a number of functions which allow immediate access to select from and dispatch to a registered store. These are most useful in low-level code where a selector or action dispatch is called a single time or at known intervals. For displaying data in a user interface, you should use [higher-order components](#higher-order-components) instead.

#### `select( storeName: string ): Object`

Given the name of a registered store, returns an object of the store's selectors. The selector functions are been pre-bound to pass the current state automatically. As a consumer, you need only pass arguments of the selector, if applicable.

_Example:_

```js
const { select } = wp.data;

select( 'my-shop' ).getPrice( 'hammer' );
```

#### `dispatch( storeName: string ): Object`

Given the name of a registered store, returns an object of the store's action creators. Calling an action creator will cause it to be dispatched, updating the state value accordingly.

_Example:_

```js
const { dispatch } = wp.data;

dispatch( 'my-shop' ).setPrice( 'hammer', 9.75 );
```

#### `subscribe(): Function`

Given a listener function, the function will be called any time the state value of one of the registered stores has changed. This function returns a `unsubscribe` function used to stop the subscription.

_Example:_

```js
const { subscribe } = wp.data;

const unsubscribe = subscribe( () => {
	// You could use this opportunity to test whether the derived result of a
	// selector has subsequently changed as the result of a state update.
} );

// Later, if necessary...
unsubscribe();
```

### Helpers

#### `combineReducers( reducers: Object ): Function`

As your app grows more complex, you'll want to split your reducing function into separate functions, each managing independent parts of the state. The `combineReducers` helper function turns an object whose values are different reducing functions into a single reducing function you can pass to `registerStore`.

_Example:_

```js
const { combineReducers, registerStore } = wp.data;

const prices = ( state = {}, action ) => {
	return action.type === 'SET_PRICE' ?
		{
			...state,
			[ action.item ]: action.price,
		} :
		state;
};

const discountPercent = ( state = 0, action ) => {
	return action.type === 'START_SALE' ?
		action.discountPercent :
		state;
};

registerStore( 'my-shop', {
	reducer: combineReducers( {
		prices,
		discountPercent,
	} ),
} );
```

### Higher-Order Components

A higher-order component is a function which accepts a [component](https://github.com/WordPress/gutenberg/tree/master/packages/element) and returns a new, enhanced component. A stateful user interface should respond to changes in the underlying state and updates its displayed element accordingly. WordPress uses higher-order components both as a means to separate the purely visual aspects of an interface from its data backing, and to ensure that the data is kept in-sync with the stores.

#### `withSelect( mapSelectToProps: Function ): Function`

Use `withSelect` to inject state-derived props into a component. Passed a function which returns an object mapping prop names to the subscribed data source, a higher-order component function is returned. The higher-order component can be used to enhance a presentational component, updating it automatically when state changes. The mapping function is passed the [`select` function](#select) and the props passed to the original component.

_Example:_

```js
function PriceDisplay( { price, currency } ) {
	return new Intl.NumberFormat( 'en-US', {
		style: 'currency',
		currency,
	} ).format( price );
}

const { withSelect } = wp.data;

const HammerPriceDisplay = withSelect( ( select, ownProps ) => {
	const { getPrice } = select( 'my-shop' );
	const { currency } = ownProps;

	return {
		price: getPrice( 'hammer', currency ),
	};
} )( PriceDisplay );

// Rendered in the application:
//
//  <HammerPriceDisplay currency="USD" />
```

In the above example, when `HammerPriceDisplay` is rendered into an application, it will pass the price into the underlying `PriceDisplay` component and update automatically if the price of a hammer ever changes in the store.

#### `withDispatch( mapDispatchToProps: Function ): Function`

Use `withDispatch` to inject dispatching action props into your component. Passed a function which returns an object mapping prop names to action dispatchers, a higher-order component function is returned. The higher-order component can be used to enhance a component. For example, you can define callback behaviors as props for responding to user interactions. The mapping function is passed the [`dispatch` function](#dispatch) and the props passed to the original component.

```jsx
function Button( { onClick, children } ) {
	return <button type="button" onClick={ onClick }>{ children }</button>;
}

const { withDispatch } = wp.data;

const SaleButton = withDispatch( ( dispatch, ownProps ) => {
	const { startSale } = dispatch( 'my-shop' );
	const { discountPercent = 20 } = ownProps;

	return {
		onClick() {
			startSale( discountPercent );
		},
	};
} )( Button );

// Rendered in the application:
//
//  <SaleButton>Start Sale!</SaleButton>
```

## Comparison with Redux

The data module shares many of the same [core principles](https://redux.js.org/introduction/three-principles) and [API method naming](https://redux.js.org/api-reference) of [Redux](https://redux.js.org/). In fact, it is implemented atop Redux. Where it differs is in establishing a modularization pattern for creating separate but interdependent stores, and in codifying conventions such as selector functions as the primary entry point for data access.

The [higher-order components](#higher-order-components) were created to complement this distinction. The intention with splitting `withSelect` and `withDispatch` — where in React Redux they are combined under `connect` as `mapStateToProps` and `mapDispatchToProps` arguments — is to more accurately reflect that dispatch is not dependent upon a subscription to state changes, and to allow for state-derived values to be used in `withDispatch` (via [higher-order component composition](https://github.com/WordPress/gutenberg/tree/master/packages/element#compose)).

Specific implementation differences from Redux and React Redux:

- In Redux, a `subscribe` listener is called on every dispatch, regardless of whether the value of state has changed.
   - In `@wordpress/data`, a subscriber is only called when state has changed.
- In React Redux, a `mapStateToProps` function must return an object.
   - In `@wordpress/data`, a `withSelect` mapping function can return `undefined` if it has no props to inject.
- In React Redux, the `mapDispatchToProps` argument can be defined as an object or a function.
   - In `@wordpress/data`, the `withDispatch` higher-order component creator must be passed a function.
