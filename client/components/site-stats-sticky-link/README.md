site-stats-sticky-link
======================

Links the user back to where they were the last time they viewed their site's stats.

Use this component when you want a link to the user's Site Stats page from anywhere in calypso.

Most of the logic is handled in the `site-stats-sticky-tab` library and its store / actions

### usage:
```jsx
var SiteStatsStickyLink = require( 'components/site-stats-sticky-link' );

/* ...inside component render method: */
<SiteStatsStickyLink
	onClick={ callback }
	title={ localizedTitle }>{
		localizedLinkTextAndOrImagesAsChildNodes
}</SiteStatsStickyLink>
```

### props:
All props are optional:
* `onClick` (function) -- a callback to execute when the user clicks the link.
* `title` (string) -- copied to the `title` attribute of the resultant link node
* children will be copied to the child nodes of the resultant link node
