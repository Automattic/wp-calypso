# browser-storage

This implements a simple promise-based key-value store using `IndexedDB`, if available, and falling
back to `localStorage` otherwise.

## Usage

```js
import { getStoredItem, setStoredItem, clearStorage } from 'calypso/lib/browser-storage';

setStoredItem( 'my-stored-key', { complex: value } ).then( () => doSomething() );
getStoredItem( 'my-stored-key' ).then( ( val ) => doSomethingWithVal( val ) );
clearStorage().then( () => console.log( 'Storage cleared' ) );
```

`undefined` is returned as the value for missing keys.

## Bypassing persistent storage

In some cases, such as support sessions, it's useful to bypass persistent storage altogether, using
a volatile memory store instead. The `bypassPersistentStorage` method exists to toggle that behavior
on and off.

```js
import { setStoredItem, bypassPersistentStorage } from 'calypso/lib/browser-storage';

async function demo() {
	// Use persistent storage.
	await setStoredItem( 'my-stored-key', 'some value' );

	// Use memory storage.
	bypassPersistentStorage( true );
	await setStoredItem( 'my-stored-key', 'another value' );

	// Use persistent storage again.
	bypassPersistentStorage( false );
	console.log( await getStoredItem( 'my-stored-key' ) ); // 'some value'
}
```

`bypassPersistentStorage` clears the memory store every time it's called with a truthy value.
