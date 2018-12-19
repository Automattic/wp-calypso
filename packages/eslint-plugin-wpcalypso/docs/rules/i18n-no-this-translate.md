# Disallow this.translate()
Disallows the usage of `this.translate()` in favor of the high order component `localize()` from `i18n-calypso` repository.

## Rule Details

This rules aims to prevent the usage of `this.translate` that uses the mixin approach which makes the components harder to test.
The following is considered a warning:

```js
class MyComponent extends React.Component {
	render() {
		return this.translate( 'Hello World' );
	}
}
```

The following patterns are not warnings:

```js
import i18n from 'i18n-calypso';
i18n.translate( 'Hello World' );
```

```js
import { localize } from 'i18n-calypso';

class MyComponent extends React.Component {
	render() {
		return this.props.translate( 'Hello World' );
	}
}

export default localize( MyComponent );
```
