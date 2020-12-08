# feature-detection

`feature-detection` is a collection of feature detection tests to see if a certain feature is supported by the browser/environment. The test functions should be kept simple and return either `true` or `false` depending on whether or not a feature is supported.

## Usage

```javascript
import { supportsFeatureToDetect } from 'calypso/lib/feature-detection';

if ( supportsFeatureToDetect() ) {
	doSomething();
}
```

## Available Tests

### supportsCssCustomProperties

A simple test to check if the browser supports CSS custom properties.
