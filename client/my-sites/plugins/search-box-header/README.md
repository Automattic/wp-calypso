# Plugins List

This component is used to render the heading of the plugin marketplace, a search bar and a list of recommended searches.

## How to use

```jsx
import SearchBoxHeader from 'calypso/my-sites/plugins/search-box-header';

<SearchBoxHeader
	doSearch={ doSearch }
	searchTerm={ search }
	siteSlug={ siteSlug }
	title={ translate( 'Plugins you need to get your projects done' ) }
	searchTerms={ [ 'shipping', 'seo', 'portfolio', 'chat', 'mailchimp' ] }
/>;
```

## Props

- `doSearch`: A function used to execute the search.
- `searchTerm`: The string used as a term to search the plugins.
- `siteSlug`: A string representing the url of the current selected site, it can be optional.
- `title`: A string that is rendered in the heading.
- `searchTerms`: An array of strings used to show recommended searches to the user.
