# Create Calypso Config

This package exports a single function which takes config data and returns the config object used around Calypso.

This was extracted from `lib/create-config`.

## ConfigApi interface

The API returned by `createConfig` is as follows. It is a function extended with a handful of useful features-oriented functions.

### config( key )

Returns the value for the given configuration key.

```js
const value = config( key )
```

### config.isEnabled( key )

Is a feature enabled?

```js
if ( config.isEnabled( 'myFeature' ) ) {
	// do something only when myFeature is enabled
}
```

### config.enabledFeatures()

Gets the list of enabled features.

```js
const enabledFeatures = config.enabledFeatures();
```

### config.enable( key )

Enable a feature.

```js
config.enable( 'myFeature' );
```
### config.disable( key )

Disable a feature.

```js
config.disable( 'myFeature' );
```

