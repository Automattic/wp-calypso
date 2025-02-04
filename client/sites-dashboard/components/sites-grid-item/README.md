# SitesGridItem

Renders a SitesGridItem component with site selection option.

## How to use

```jsx
import SitesGridItem from 'calypso/sites-dashboard/components/sites-grid-item';
import type { SiteExcerptData } from '@automattic/sites';

function render() {
	const site = {};
	return (
		<div>
			<SitesGridItem
				site={ site }
				key={ site.ID }
				onSiteSelectBtnClick={ ( s: SiteExcerptData ) => {} }
			/>
		</div>
	);
}
```

## Props

- `site`: a site data e.g. SiteExcerptData object.
- `key`: unique key eg. Site ID.
- `onSiteSelectBtnClick`: function.
