# Disallow this.translate()
Disallows the usage of `this.translate()` in favor of the high order component `localize()` from `i18n-calypso` repository.

## Rule Details

This rules aims to prevent the usage of `this.translate` that uses the mixin approach which makes the components harder to test.
The following is considered a warning:
```js
const MyComponent = React.createClass( {
	render() {
		return this.translate( 'Hello World' );
	}
} );
```

The following patterns are not warnings:

```js
import i18n from 'i18n-calypso';
i18n.translate('Hello World');
```

```js
import { localize } from 'i18n-calypso';
const MyComponent = React.createClass( {
	render() {
		return this.props.translate( 'Hello World' );
	}
} );
export default localize( MyComponent );
```
