Query Plugin List
===========================

`<QueryPluginLists />` is a React component used to load the different plugins lists used in calypso's plugin browser. It receive an array of categories to fetch, and launches the request against WordPress.org plugins directory API

## Usage

Render the component, passing it a list of categories to fetch. The component does not accept any children, nor does it render any of its own.

```jsx
function PluginBrowser() {
	const categories = [ 'new', 'popular' ];
	return <QueryPluginLists categories={ categories } />;
}

```

## Props

### `categories`

<table>
	<tr><th>Type</th><td>Array</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>
