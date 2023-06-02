# SitesTableRow

Renders a SitesTableRow component.

## How to use

```jsx
import SitesTableRow from 'calypso/sites-dashboard/components/sites-table-row';

function render() {
	const site = {};
	return (
		<table>
			<tbody>
				<SitesTableRow site={ site } key={ site.ID }></SitesTableRow>
			</tbody>
		</table>
	);
}
```

## Props

- `site`: a site data e.g. SiteExcerptData object.
- `key`: unique key eg. Site ID.
