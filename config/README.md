Config
======

This dir is used to store `.json` config files. At boot-up time, the server decides which config file to use based on the `NODE_ENV` environment variable. The default value is `"development"`. The entire configuration is available on the server-side and most keys are also exposed to the client.  The config is sent to the client as part of the initial payload in `server/render/index.js` and `server/pages/index.pug`.

If it is necessary to access a `config` value on the client-side, add the property name to the `client.json` file, which is whitelist of config properties that will be exposed to the client.

Server-side and client-side code can retrieve a config value by invoking the `config()` exported function with the desired key name:

```js
var config = require( 'config' );
console.log( config( 'redirect_uri' ) );
```

Feature Flags
-------------

The config files contain a features object that can be used to determine whether to enable a feature for certain environments. This allows us to merge in-progress features without launching them to production. The config module adds a method to detect this: `config.isEnabled()`. Please make sure to add new feature flags alphabetically so they are easy to find.

```json
{
	"features": {
		"manage/posts": true,
		"reader": true
	}
}
```

If you want to temporarily enable/disable some feature flags for a given build, you can do so by setting the `ENABLE_FEATURES` and/or `DISABLE_FEATURES` environment variables. Set them to a comma separated list of features you want to enable/disable, respectively:

```bash
ENABLE_FEATURES=manage/plugins/compatibility-warning DISABLE_FEATURES=code-splitting,reader npm start
```
