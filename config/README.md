# Config

This dir is used to store `.json` config files. At boot-up time, the server decides which config file to use based on the `NODE_ENV` environment variable. The default value is `"development"`. The entire configuration is available on the server-side and most keys are also exposed to the client. The config is sent to the client as part of the initial payload in `server/render/index.js` and `client/document/index.jsx`.

If it is necessary to access a `config` value on the client-side, add the property name to the `client.json` file, which is list of specific config properties that will be exposed to the client.

Server-side and client-side code can retrieve a config value by invoking the `config()` exported function with the desired key name:

```js
import config from '@automattic/calypso-config';
console.log( config( 'redirect_uri' ) );
```

## Feature Flags

The config files contain a features object that can be used to determine whether to enable a feature for certain environments. This allows us to merge in-progress features without launching them to production. The config module adds a method to detect this: `config.isEnabled()`.

```json
{
	"features": {
		"reader": true
	}
}
```

Please make sure to add new feature flags alphabetically so they are easy to find and add any new feature flags in all config files (client.json, development.json, production.json, horizon.json, stage.json, test.json, wpcalypso.json).

You can search for feature flags by partial string or regular expression with the [bin/feature-search.js](bin/feature-search.js) tool.

Run `yarn feature-search [search]` from the root calypso directory to see example searches.

You can also activate feature flags only in your development environment. To do this, create a `.env` file in the root folder of the cloned repository. Add the variable `ACTIVE_FEATURE_FLAGS`, and specify the feature flags you want to activate, as a string separated by commas. For more details of how to create the `.env` file, see <https://github.com/mrsteele/dotenv-webpack#create-a-env-file>.

### Progression of Environments

When working with feature flags, there is a progression of environments that should be considered.

For development of WordPress.com, that looks something like:

> development -> wpcalypso -> horizon -> stage -> production

For development of Jetpack, this looks something like:

> jetpack-cloud-development -> jetpack-cloud-horizon -> jetpack-cloud-stage -> jetpack-cloud-production

For development of Automattic for Agencies, this looks something like:

> a8c-for-agencies-development -> a8c-for-agencies-horizon -> a8c-for-agencies-stage -> a8c-for-agencies-production

As we enable a feature through these progressions, left to right, the feature should most likely be enabled on environments to the left. For example, if a WordPress.com feature is currently enabled in horizon, it should likely also be enabled in development and wpcalypso.

Lastly, once you ship to production, you should consider cleaning up your flag checks to leave a tidy development environment.

### Testing Feature Flags Locally

If you want to temporarily enable/disable some feature flags for a given build, you can do so by setting the `ENABLE_FEATURES` and/or `DISABLE_FEATURES` environment variables. Set them to a comma separated list of features you want to enable/disable, respectively:

```bash
ENABLE_FEATURES=some/flag-name DISABLE_FEATURES=reader yarn start
```

### Testing Feature Flags via URLs

If you want to temporarily enable/disable some feature flags you can add a `?flags=` query parameter to the URL.

**Note** that this **only** works on development, staging, and calypso.live, **not** in production (this functionality is not suitable for public use on `*.wordpress.com`).

- `?flags=foo` enables feature _foo_.
- `?flags=-bar` disables feature _bar_.
- `?flags=foo,-bar` enables feature _foo_ and disables feature _bar_.

E.g. <http://calypso.localhost:3000/?flags=some/flag-name>
