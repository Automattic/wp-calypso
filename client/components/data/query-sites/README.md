Query Sites
===========================

`<QuerySites />` is a React component used in managing network requests for sites. If passed a site ID, it will request the site when the component is mounted. If no site ID is passed, it will request all sites for the current user.

## Usage

Render the component, optionally passing a site ID. The component does not accept any children, nor does it render any of its own.

```jsx
function AllSites() {
	return <QuerySites />;
}

function SingleSite() {
	return <QuerySites siteId={ 2916284 } />
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

An optional prop specifying a single site to be requested. If omitted, all sites for the current user will be requested.
