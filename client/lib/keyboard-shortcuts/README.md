# Keyboard Shortcuts

This module emits an event when a keyboard shortcut is used, indicating the keyboard shortcut that was triggered. It provides a layer of abstraction between the keys used to trigger shortcuts and the actions that a component should bind to these shortcuts.

## Usage

This module can be used outside of React, but this is a typical use within React:

```js
import KeyboardShortcuts from 'calypso/lib/keyboard-shortcuts';

class MyComponent extends React.Component {
	componentWillMount() {
		KeyboardShortcuts.on( 'open-selection', this.openSelectedPost );
	}

	componentWillUnmount() {
		KeyboardShortcuts.off( 'open-selection', this.openSelectedPost );
	}

	openSelectedPost() {
		/*...*/
	}
}
```

A full list of keyboard shortcut events is stored in `key-bindings.js`. New keyboard shortcuts can be added to `key-bindings.js` in the following format:

```js
// required properties
const object1 = {
	eventName: 'myShortcutEvent', // this event will be emitted when the shortcut is triggered
	keys: [ 'shift', '/' ], // the keys used to trigger the shortcut
	description: {
		keys: [ '?' ], // the shortcut's key combination, as it will appear in the keyboard shortcuts menu
		text: i18n.translate( 'This is my new shortcut!' ), // a textual description of the shortcut
	},
};

// keys also accepts an array of key combination arrays, in order to bind multiple key combinations to the same event
const object2 = {
	/*...*/
	eventName: 'reply',
	keys: [
		[ 'control', 'enter' ],
		[ 'command', 'enter' ],
	],
	// both control + enter and command + enter will trigger a 'reply' event
	/*...*/
};

// optional properties
const object3 = {
	/*...*/
	eventName: 'name',
	keys: [
		/*...*/
	],
	type: 'sequence', // triggers the shortcut after the keys are entered in sequence
	checkKeys: [ '?' ], // Optional value for non-sequence bindings. If set, checks if the value of e.key or e.keyIdentifier matches any characters in the list before firing the event.
	description: {
		/*...*/
	},
	/*...*/
};
```

## Internationalization

The key-bindings module (`key-bindings.js`) uses the `i18n` mixin to provide translations of the descriptions for each keyboard shortcut. When the language changes, `KeyBindings` will emit a `language-change` event, after which any component displaying the textual descriptions of the keyboard shortcuts will need to reload the key-bindings and re-render. At this point, the only other module that should be requiring `key-bindings.js` directly is the keyboard shortcuts menu.
