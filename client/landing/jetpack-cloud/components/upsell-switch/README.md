# UpsellSwitch

`<UpsellSwitch />` is a component to show an upsell page if a given site does not have a capability.

It functions by querying the Rewind capabilities for a site and checks for a target capability. If the site does not have that capability it displays the upsell component, otherwise the children components.

It is designed to be wrapped around a page like so:
```jsx
const Page = (
	<UpsellSwitch upsell={ <UpsellPage /> } targetCapability="test">
		<ContentPage />
	</UpsellSwitch>
);
```
Alternatively, it can be inserted into a controller callback stack like so:
```jsx
export function showUpsellTest( context, next ) {
	context.primary = (
		<UpsellSwitch upsell={ <UpsellPage /> } targetCapability="test">
			{ context.primary }
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
### `upsell`
Required. A component to display when an upsell is required.
### `targetCapability`
Required. String to look for in list of site capabilities returned by API.
