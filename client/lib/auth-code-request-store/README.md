# Auth Code Request Store

For requesting SMS Auth Codes during sign-in using OAuth login. Currently used by [client/auth/auth-code-button](client/auth/auth-code-button.jsx) to request auth codes.

Requests are rate limited by the actions provided int `lib/auth-code-request-store/actions`.

### Example

```js

import Store from 'lib/auth-code-request-store'
import actions from 'lib/auth-code-request-store/actions'

Store.on( 'change', () => {
    console.log( "Store changed", Store.get() );
} );

// To request an oauth token

actions.requestCode( 'samgamgee', 'secondbreakfast' );

```
