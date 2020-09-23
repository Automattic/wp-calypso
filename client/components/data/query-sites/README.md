# Query Sites

`<QuerySites />` is a React component used in managing network requests for sites.

## Usage

The component does not accept any children, nor does it render any of its own.

If you want to request a single site, provide its ID with `siteId`. If you want to request all sites,
provide the `allSites` prop. If you want to request the primary and the recent sites, provide the
`primaryAndRecent` prop. You can also combine these props.

If the `siteId`, primary site or recent sites change (ie Redux is updated with new data), `QuerySites` will
re-fetch them if it's not fetching them already. If `allSites` is provided, it will request all sites just once,
even if state has been updated.

```jsx
function AllSites() {
	return <QuerySites allSites />;
}

function SingleSite() {
	return <QuerySites siteId={ 2916284 } />;
}

function PrimaryAndRecentSites() {
	return <QuerySites primaryAndRecent />;
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number or String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

An optional prop specifying a single site to be requested. Can be either a site ID or slug.

### `primaryAndRecent`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

An optional prop specifying primary and recent sites to be requested.

### `allSites`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

An optional prop specifying all sites to be requested. If true, all sites for the current user will be requested.
