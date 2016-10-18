Query Jetpack Plugins
=================

`<QueryJetpackPlugins />` is a React component used in managing network requests for Jetpack plugins.

## Usage

Render the component, passing `sites`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

## Props

### `sites`

<table>
	<tr><th>Type</th><td>Array</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The array of sites for which Jetpack plugins should be requested.
