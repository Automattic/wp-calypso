Utils
========

A module for those little helpers that need to interact with the store.

# Actions
Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

## uniqueId( prefix )
Meant as a replacement for _ and lodash "uniqueId" function.
Returns unique numeric prefixed by prefix and increments internal state, so the next uniqueId will be different.

```js
import { uniqueId } from 'state/utils/actions';

const id = dispatch( uniqueId( 'myprefix_' ) );
```

