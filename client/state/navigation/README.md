# Navigation middleware

The purpose of the navigation middleware is to eventually let us run Calypso navigation through Redux.

## Rationale

This is the starting point for letting us handle navigation through Redux, as part of our state tree.  
In order to do that, we'd need to handle the following cases:

- The app requesting navigation to a given path as result of another action or user interaction
- The browser informing us that the path has changed

Adding handlers for these events would allow us to reliably track the current path within redux and eventually make it the source of truth for matching the routes with our views.  
The first step to get us there is adding a `NAVIGATE` action that will be responsible for triggering redirects, so we can build the rest around it in the future.

## How to use

Currently the middleware supports one action - `NAVIGATE`.  
Dispatching it will perform a redirect to the given path.

```js
import { navigate } from 'state/ui/actions';

...

dispatch( navigate( '/your/path/here' ) );
```
