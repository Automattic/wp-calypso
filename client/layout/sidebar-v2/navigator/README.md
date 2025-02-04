# Sidebar Navigator Components

A collection of components designed to create a navigational sidebar using the experimental Navigator components from the WordPress package.

## Components

### SidebarNavigator

Main container for the navigator.

**Props:**

- `initialPath`: The initial path of the navigator.
- `children`: Children to render inside the navigator.

### SidebarNavigatorMenu

A container for navigational menu items.

**Props:**

- `description`: Description of the menu.
- `backButtonProps`:
  - `icon`: Icon for the back button.
  - `label`: Text label for the back button.
  - `onClick`: Callback when the back button is clicked.
- `path`: Path for the navigator screen.
- `children`: Children to render inside the menu.

### SidebarNavigatorMenuItem

A component representing an individual menu item.

**Props:**

- `icon`: Icon for the menu item.
- `path`: Path for the navigator.
- `link`: URL link for the menu item.
- `title`: Text for the menu item.
- `onClickMenuItem`: Callback when the menu item is clicked.
- `withChevron`: If true, a chevron icon is shown.
- `isExternalLink`: If true, an external link icon is shown.
- `isSelected`: If true, the menu item appears as selected.

## Usage

```jsx
<SidebarNavigator initialPath="/initial-path">
	<SidebarNavigatorMenu path="/menu-path" description="My Menu">
		<SidebarNavigatorMenuItem
			icon={ SampleIcon }
			path="/item-path"
			link="/item-link"
			title="Menu Item 1"
			onClickMenuItem={ handleClick }
			isSelected
		/>
	</SidebarNavigatorMenu>
</SidebarNavigator>
```
