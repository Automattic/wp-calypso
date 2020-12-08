# client/config

This module reads config data from `window.configData` (passed from the Node.js
server in the HTML response) and initializes a `config` object that is
used to read these values.

You can read more about how to use `config` in the
[config documentation](../../config).

## Feature Flags API

The config files contain a features object that can be used to determine
whether to enable a feature for certain environments. This allows us to merge
in-progress features without launching them to production.

### config.isEnabled( key )

Is a feature enabled?

```js
import config from 'calypso/config';

if ( config.isEnabled( 'myFeature' ) ) {
	// do something only when myFeature is enabled
}
```

The key should always be a literal string not a variable so that down the road
we can process the compiled scripts and remove code for disabled features in
production.

When Calypso is running in development mode or in the `stage` environment, you
can specify a `?flags=` query argument or a `flags` cookie to modify feature
flags for each full page load.

Query argument examples:

- `?flags=flag1`: Enable feature `flag1`.
- `?flags=-flag2`: Disable feature `flag2`.
- `?flags=+flag1,-flag2`: Enable feature `flag1` and disable feature `flag2`.

You can use the same syntax in a cookie:

- `document.cookie = 'flags=+flag1,-flag2;max-age=1209600;path=/';`: Enable feature `flag1` and disable feature `flag2`.
- `document.cookie = 'flags= ; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';`: Reset flags cookie to config values.

Note: the `flags` query argument and cookie won't work for feature flags used by the Node.js
server. For this case, you can use the
[`ENABLE_FEATURES` and/or `DISABLE_FEATURES`](../../config/README.md#feature-flags)
environment variables instead.

## Testing for calypso.live environment

We often need to enable or disable certain features not only based on the Calypso environment
(development, production, staging, horizon, ...) but also when Calypso runs in the calypso.live
testing environment. The `config` module exports a helper function `isCalypsoLive` that returns
`true` if Calypso is running on the `*.calypso.live` origin.

```js
import { isCalypsoLive } from 'calypso/config';

if ( isCalypsoLive() ) {
	/* ... */
}
```
