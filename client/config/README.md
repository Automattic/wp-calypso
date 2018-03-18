client/config
=============

This module reads config data from `window.configData` (passed from the Node.js
server in the HTML response) and initializes a `config` object that is
used to read these values.

You can read more about how to use `config` in the
[config documentation](../../config).

Feature Flags API
-----------------

The config files contain a features object that can be used to determine
whether to enable a feature for certain environments. This allows us to merge
in-progress features without launching them to production.

### config.isEnabled( key )

Is a feature enabled?

``` js
import config from 'config';

if ( config.isEnabled( 'myFeature') ) {
	// do something only when myFeature is enabled
}
```

The key should always be a literal string not a variable so that down the road
we can process the compiled scripts and remove code for disabled features in
production.

When Calypso is running in development mode or in the `stage` environment, you
can specify a `?flags=` query argument to modify feature flags for each full
page load.  Examples:

- `?flags=flag1`: Enable feature `flag1`.
- `?flags=-flag2`: Disable feature `flag2`.
- `?flags=+flag1,-flag2`: Enable feature `flag1` and disable feature `flag2`.

Note: the `?flags` argument won't work for feature flags used by the Node.js
server.  For this case, you can use the
[`ENABLE_FEATURES` and/or `DISABLE_FEATURES`](../../config/README.md#feature-flags)
environment variables instead.
