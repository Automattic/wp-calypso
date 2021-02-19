# Updater

Base class for Auto- and Manual updater.

## Options

- **`confirmLabel`** = `Update & Restart` - Label for the confirm button of the "Update is available" dialog
- **`dialogMessage`** = `{name} {newVersion} is now available — you have {currentVersion}. Would you like to update now?` - Message for the dialog
- **`dialogTitle`** = `A new version of {name} is available!` - Title for the dialog
- **`beta`** = `false` - Check for beta versions

## Methods

### `Updater.ping()`

Checks for updates.

```js
updater.ping();
```

### `Updater.setVersion()`

Sets the new version for the updater dialog.

```js
updater.setVersion( '1.0.1' );
```

### `Updater.notify()`

Prompts the user with the update dialog.
`this.onConfirm` and `this.onCancel` will be executed based on the users confirmation or cancellation.

```js
class MyUpdater extends Updater {
	constructor( { options } ) {
		super( options );
	}

	async ping() {
		// check for update
		if ( shouldUpdate ) {
			this.setVersion( '1.0.0' );
			this.notify();
		}
	}
}
```

### `Updater.expandMacros( text )`

Expands macros.

Available macros are

- **`name`** = `app.getName()`
- **`currentVersion`** = `app.getVersion()`
- **`newVersion`** = `this._version` (defined by `this.setVersion()`)

```js
updater.expandMacros( '{name} {newVersion} is now available' ); // WordPress.com 1.0.1 is now available
```

### `Updater.onConfirm()`

Function that will be triggered when the user click the confirm button.

```js
class MyUpdater extends Updater {
	onConfirm() {
		// Download Update
		autoUpdater.quitAndInstall();
		// or for e.g. manual updater
		shell.openExternal( 'http://...' );
	}
}
```

### `Updater.onCancel()`

Function that will be triggered when the user clicks the cancel button.

```js
class MyUpdater extends Updater {
	onCancel() {
		// The user has cancelled the updater
	}
}
```
