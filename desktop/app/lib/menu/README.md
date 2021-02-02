# Menu

Provides all the app system menus.

The main menu template is `main-menu.js`, and each submenu is stored in a seperate file.

Any menu item with `requiresUser: true` will be toggled by `enableLoggedInItems` and `disableLoggedInItems`.

## Functions

`set( app, mainWindow)` - called after the app has been initialized and we have access to the window

Where:

- `app` - the Electron app instance
- `mainWindow` - the app's main BrowserWindow

`enableLoggedInItems()` - enable all menu items that require a logged-in user

`disableLoggedInItems()` - disables all menu items that require a logged-in user
