# Author Selector

This component allows an administrator with sufficient privileges to edit the author of a post. Use it by wrapping the element that you will use to toggle the menu open/closed.

```js
<AuthorSelector post={ post }>
	<span>by William Shakespeare</span>
</AuthorSelector>;
```

The component will retrieve site users and render the child span as a clickable element to expand the `author-selector` UX. If selecting other authors is not appropriate (i.e., only one available author, Users not loaded, or insufficient permission), it will simply display the span.

## Props

- siteId - The siteId for site from which to fetch authors
- onSelect - Function to call when user is selected, selected `author` passed as parameter
- exclude - Optional array of users IDs to be excluded from the author selector, or a function that takes a `user` as an argument, and returns whether that user should be excluded.
- allowSingleUser - Optional boolean for whether or not to display the author selector when there is only one user. Default is `false`.
- popoverPosition - Optional string position of the popover with clickable users, relative to the `AuthorSelector`. Default is `'bottom left'`.
- transformAuthor - Optional function that can be used to transform each user object before rendering the corresponding author popover menu item.
