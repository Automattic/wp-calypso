# Navigation middleware

In its current state, the middleware allows for triggering redirects within the app by dispatching a redux action.

## How to use

Dispatching a `NAVIGATE` action and providing a `path` will trigger a redirect, just like calling `page()`.

```js
import { navigate } from 'calypso/state/ui/actions';

dispatch( navigate( '/your/path/here' ) );
```

The action was added to address some issues with calling `page()` directly, particularly related triggering redirects from the [data layer](https://github.com/Automattic/wp-calypso/tree/HEAD/client/state/data-layer) and testing.
