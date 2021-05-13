# withTrackingTool

This high-order component allows us to load a tracking tool when component gets mounted.

The `withTrackingTool` is called with a `trackingTool` parameter. Currently, only the `HotJar` tracking tool is supported.

The return is a wrapper function that takes your component and loads the specified tracking tool on top of it.

## Usage

When directly wrapping a component:

```js
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';

class MyComponent {
	render() {
		// Something
	}
}

export default withTrackingTool( 'HotJar' )( MyComponent );
```

When combined with other wrappers (like `localize()`):

```js
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

class MyComponent {
	render() {
		// Something
	}
}

export default flowRight( localize, withTrackingTool( 'HotJar' ) )( MyComponent );
```
