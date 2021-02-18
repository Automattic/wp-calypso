# Sidebar Navigation

This component is used to display the mobile sidebar navigation header at the top of content sections. It sets `layout-focus` to `sidebar`.

## How to use

Put the component in your `Main` component, and wrap it around any components you want it to display as its children. It relies on the [`document-head`](/client/state/document-head) Redux subtree, whose fields you can set through the [`DocumentHead`](/client/components/data/document-head) component. It handles detecting the selected site.

```js
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import Gridicon from 'calypso/components/gridicons';

function render() {
	return (
		<Main>
			<SidebarNavigation title="Themes" sectionName="site" sectionTitle="My Sites">
				<Gridicon icon="my-sites" size={ 36 } />
			</SidebarNavigation>
		</Main>
	);
}
```
