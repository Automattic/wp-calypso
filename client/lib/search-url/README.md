# search-url

`search-url` is a semi-replacement for the deprecated `url-search` mixin, and contains a function that determines if the page URL needs updating during a search.

In this example `doSearch` is a function to perform a search. If `doSearch` is undefined then the page URL is updated

```js
searchUrl( searchValue, previousSearchValue, doSearch );
```

## History

`search-url` adds the first search result page to the browser history, and then uses push-state to update the page on subsequent searches. So only the most-recent
search is persisted in the browser's history.
