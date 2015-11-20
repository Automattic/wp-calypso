Sidebar Navigation
==================

This component is used to display the mobile sidebar navigation header at the top of content sections. It sets `layout-focus` to `sidebar`.

#### How to use:

Put the component in your `Main` component, and wrap it around any components you want it to display as its children. It relies on [screen-title](/client/lib/screen-title) being set in your controller. It handles detecting the selected site.

```js
var SidebarNavigation = require( 'components/sidebar-navigation' ),
	Gridicon = require( 'components/gridicon' );

render: function() {
    return (
        <Main>
		<SidebarNavigation
			title="Themes"
			sectionName="site"
			sectionTitle="My Sites">
			<Gridicon icon="my-sites" size={ 30 } />
		</SidebarNavigation>
        </Main>
    );
}
```
