# Sidebar Navigation

This component is used to display the mobile sidebar navigation header at the top of content sections. It sets `layout-focus` to `sidebar`.

## How to use

Put the component in your `Main` component. It handles detecting the selected site.

```js
import SidebarNavigation from './sidebar-navigation';

function render() {
	return (
		<Main>
			<SidebarNavigation />
		</Main>
	);
}
```
