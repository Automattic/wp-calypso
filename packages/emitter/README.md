# Emitter

This utility function allows us to listen for changes to a store and then fire events when the store changes.

### Usage

```js
import { emitter } from '@automattic/emitter';
const Store = createAStore();
emitter( Store );
Store.emit('someFunction');
```
