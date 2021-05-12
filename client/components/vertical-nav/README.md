# VerticalNav

These are two components to display rows of links.

## Usage

```js
// actual links items
<VerticalNav>
	<VerticalNavItem path="/stats">Stats</VerticalNavItem>
	<VerticalNavItem path="https://google.com" external>
		Google
	</VerticalNavItem>
	<VerticalNavItem path="/posts" onClick={ this.handleClickPosts }>
		Posts
	</VerticalNavItem>
	<VerticalNavItem isPlaceholder />
</VerticalNav>;
```

## Props

`VerticalNavItem` is the only component thats behavior changes based on the given props.

- **external** - Boolean _optional_ - determines whether or not the link is opened in a new window.
- **isPlaceholder** - Boolean _optional_ - determines whether or not the placeholder styles are used.
- **onClick** - Function _optional_ - called when the item is clicked.
- **path** - String _required_ - the page the user is taken to when the item is clicked.
