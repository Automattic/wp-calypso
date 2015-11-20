Author Selector
======================

This component allows an administrator with sufficient privileges to edit the author of a post. Use it by wrapping the element that you will use to toggle the menu open/closed.

```js
<AuthorSelector
	post={ post }>
	<span>by William Shakespeare</span>
</AuthorSelector>
```

The component will retrieve site users and render the child span as a clickable element to expand the `author-selector` UX. If selecting other authors is not appropriate (i.e., only one available author, Users not loaded, or insufficient permission), it will simply display the span.

### Props
* siteId - siteId for site from which to fetch authors
* onSelect - function to call when user is selected, selected `author` passed as parameter
* exclude - Optional array of users IDs to be excluded from the author selector
* allowSingleUser - Optional boolean for whether or not to display the author selector when there is only one user
