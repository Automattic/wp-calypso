# SitesGridItem

Renders a SitesGridItem component.

## How to use

```jsx
import SitesGridItem from 'calypso/sites-dashboard/components/sites-grid-item';

function render() {
	const site = {};
	return (
		<div>
			<SitesGridItem site={ site } key={ site.ID }></SitesGridItem>
		</div>
	);
}
```

## Props

- `site`: a site data e.g. SiteExcerptData object.
- `key`: unique key eg. Site ID.
