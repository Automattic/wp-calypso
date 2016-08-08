Query Plugin Keys
=================

`<QueryPluginKeys />` is a React component used in managing network requests for premium plugin registration keys.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The site ID for which plugins should be requested. The API handles determining which plugins are enabled, based on the current site's plan.
