# Sidebar Navigation System Overview

This document provides an overview of the sidebar navigation system's structure
and how its various components interact within the application.

The `SidebarContent` component serves as the foundation of the sidebar,
while the routing system facilitates navigation functionality.

## Understanding the Example Implementation

The following example demonstrates how navigation is structured within
the sidebar. It consists of a sidebar layout, individual navigation items,
and a routing context to manage the navigation state dynamically.

### 1. Routing Context Setup

The `RouterProvider` wraps the sidebar content,
ensuring the route state is managed correctly.
It takes `routes` and `pathArg` as props to configure how navigation behaves.

```tsx
<RouterProvider routes={ [] } pathArg="page">
	<SidebarNavigationScreen
		isRoot
		title={ __( 'Home' ) }
		content={ <ExampleSidebarItems /> }
	/>
</RouterProvider>
```

- `routes`: Defines the available routes (empty here for simplicity).
- `pathArg`: Specifies the query parameter used for routing.
- `SidebarNavigationScreen`: Displays the content associate with the current navigation state.

### 2. Navigation Items and Active States

The `ExampleSidebarItems` component dynamically renders navigation item
inside the sidebar. Each item is associated with a specific route, and the
`useLocation` hook determines whether it is active.

```tsx
const ExampleSidebarItems = () => {
	const { path } = useLocation();

	return (
		<ItemGroup>
			<SidebarNavigationItem
				icon={ <Icon icon={ navigation } /> }
				key="sidebar-item-reports"
				to="/reports"
				uid="reports"
				withChevron={ false }
				aria-current={ path === '/reports' }
			>
				{ __( 'Reports' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ <Icon icon={ settings } /> }
				key="sidebar-item-settings"
				to="/settings"
				uid="settings"
				withChevron={ false }
				aria-current={ path === '/settings' }
			>
				{ __( 'Settings' ) }
			</SidebarNavigationItem>

			<SidebarNavigationItem
				icon={ <Icon icon={ archive } /> }
				key="sidebar-item-archive"
				to="/archive"
				uid="archive"
				withChevron={ false }
				aria-current={ path === '/archive' }
			>
				{ __( 'Archive' ) }
			</SidebarNavigationItem>
		</ItemGroup>
	);
};
```

### 3. Integrating Navigation Items into the Sidebar

Once the navigation items are defined, they are passed as content to the
`SidebarNavigationScreen`. This setup ensures that navigation updates
dynamically as users move through the application.

```tsx
<SidebarContent>
	<RouterProvider routes={ [] } pathArg="page">
		<SidebarNavigationScreen
			isRoot
			title={ __( 'Home' ) }
			content={ <ExampleSidebarItems />
		} />
	</RouterProvider>
</SidebarContent>
```
