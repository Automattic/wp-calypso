Menus
=====

Module for creating and editing site menus. Aims to be at feature parity with `wp-admin/nav-menus.php`, and to surpass it in UX.

### `menus.jsx`

The main parent component for the Menus module. Handles the fetching of data with MenuData and tracks the currently selected location.

Accepts the prop `site`

### `menu.jsx`

Renders a menu. Holds and manipulates the state for adding and moving menu items.

Accepts the props `selectedMenu` and `siteMenus`

### `menu-picker.jsx`

This `MenuPicker` component allows the selection of a menu, by means of a dropdown list. The selected menu is passed to the `selectHandler` callback.

Accepts the props `menus`, `selectedMenu` and `selectHandler`

### `location-picker.jsx`

The `LocationPicker` component allows the selection of a menu location, by means of a dropdown list. The selected location is passed to the `selectHandler` callback.

Accepts the props `menus`, `selectedLocation` and `selectHandler`

### `menu-item-list.jsx`

The `MenuItemList` component renders a list of `MenuItem`s.

Accepts the prop `items`, which should be a nested list of menu items.

The `MenuItem` component renders the menu item itself, along with any parents, by using `MenuItemList`

Accepts the props `name` for the item name, and `items` as an array of sub-menu items.

### `menu-name.jsx`

Allows a menu title to be edited, when either the pencil icon or the text itself is clicked. It returns the edited text via the `onChange` callback.

Accepts the props `value` and `onChange`.

### `menu-revert-button.jsx`

Discards any unsaved changes and reloads the menu state from the server.

Accepts the prop `menuData` which should be an instance of `MenuData`.
