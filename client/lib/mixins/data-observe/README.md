Data Change
===========

**This is deprecated! Please use Redux instead. Refer to the [docs on data handling](/docs/our-approach-to-data.md).**

A React mixin that makes it easy to trigger re-rendering of a component when a `prop` emits a `change` event.


### Usage


```js
var observe = require( 'lib/mixins/data-observe' );

const Component = React.createClass({
	mixins: [ observe( 'sites', 'user' ) ]
});
```

([Read more about React mixins](http://facebook.github.io/react/docs/reusable-components.html#mixins).)
