# VerticalNav

The following components can be used to display rows of links.

## Usage

```js
<VerticalNav>
	<VerticalNavItem path="/stats">Stats</VerticalNavItem>

	<VerticalNavItem path="https://google.com" external>
		Google
	</VerticalNavItem>

	<VerticalNavItem path="/posts" onClick={ this.handleClickPosts }>
		Posts
	</VerticalNavItem>

	<VerticalNavItem isPlaceholder />

	<VerticalNavItemEnhanced
		description="https://wordpress.com"
		gridicon="my-sites"
		path="https://wordpress.com"
		text="Create new site"
	/>
</VerticalNav>;
```

## Props

`VerticalNavItem` is usually used to display some text passed as `children`, and accepts the following props:

- **className** - String _optional_ - additional class name to tag this component with.
- **external** - Boolean _optional_ - determines whether or not the link is opened in a new window.
- **isPlaceholder** - Boolean _optional_ - determines whether or not the placeholder styles are used.
- **onClick** - Function _optional_ - called when the item is clicked.
- **path** - String _optional_ - the page the user is taken to when the item is clicked.

`VerticalNavItemEnhanced` can also display a description as well as an icon. It no longer relies on `children` but
instead on the following props:

- **description** - String _required_ - some longer copy displayed below the text.
- **external** - Boolean _optional_ - determines whether or not the link is opened in a new window.
- **gridicon** - String _optional_ - the identifier of the [Gridicon icon](../../../docs/icons.md) to show in front of the text and description (if `materialIcon` wasn't specified).
- **materialIcon** - String _optional_ - the identifier of the [Material Design icon](../../../packages/material-design-icons/README.md) to show in front of the text and description (if `gridicon` wasn't specified).
- **onClick** - Function _optional_ - called when the item is clicked.
- **path** - String _optional_ - the page the user is taken to when the item is clicked.
- **text** - String _required_ - the main text of the navigation item.
