# Data Change

**This is deprecated! Please use Redux instead. Refer to the [docs on data handling](/docs/our-approach-to-data.md).**

A React mixin that makes it easy to trigger re-rendering of a component when a `prop` emits a `change` event.

## Usage

```js
/* eslint-disable react/prefer-es6-class */
import observe from 'calypso/lib/mixins/data-observe';
import createReactClass from 'create-react-class';

const Component = createReactClass( {
	mixins: [ observe( 'sites', 'user' ) ],
} );
```

([Read more about React mixins](http://facebook.github.io/react/docs/reusable-components.html#mixins).)
