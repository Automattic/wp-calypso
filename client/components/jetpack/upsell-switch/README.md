# UpsellSwitch

`<UpsellSwitch />` is a component to show an upsell page if a given site's state is unavailable.

It functions by being passed a query component and function, which is used to query the site state. If the state is `unavailable`, it shows the upsell component with a `reason` passed as a prop.

It is designed to be wrapped around a page like so:
```jsx
const Page = (
	<UpsellSwitch
		UpsellComponent={ UpsellPage }
		QueryComponent={ QuerySite }
		getStateForSite={ getStateBySiteId }
		display={ <ContentPage /> }
	>
		<div>Loading...</div>
	</UpsellSwitch>
);
```
Alternatively, it can be inserted into a controller callback stack like so:
```jsx
export function showUpsellTest( context, next ) {
	context.primary = (
		<UpsellSwitch
			UpsellComponent={ UpsellPage }
			QueryComponent={ QuerySite }
			getStateForSite={ getStateBySiteId }
			display={ context.primary }
		>
			<div>Loading...</div>
		</UpsellSwitch>
	);
	next();
}
```
and used in the page callbacks _after_ the page is declared:
```js
page(
	'/test/:site',
	siteSelection,
	navigation,
	test,
	showUpsellTest,
	makeLayout,
	clientRender
);
```
## Props
The following props can be passed to the `<UpsellSwitch />` component:
### `UpsellComponent`
Required. A component to display when an upsell is required. Will be passed `reason` as a prop, if any.
### `QueryComponent`
Required. A data component to query the site state.
### `getStateForSite`
Required. Function to pull the state of the system from the store. Should take the Redux state as the first arg, and the site ID as the second.
### `display`
Required. A component to display with the site has a valid status.
### `children`
Optional. Components to display while loading site state.
