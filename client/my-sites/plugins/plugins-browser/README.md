# Plugins Browser

This component renders the main plugins browser page.

## How to use

```js
import BrowserMainView from 'calypso/my-sites/plugins/plugins-browser';

function render() {
	return (
		<div>
			<BrowserMainView
				site={ site }
				sites={ sites }
				category={ category }
				search={ searchTerm }
				path={ path }
			/>
		</div>
	);
}
```

## Props

- `site`: a string containing the slug of the selected site
- `sites`: a sites-list object
- `category`: a string with the current selected category
- `search`: a string with the current search term, if exists
- `path`: a string with the current url path
