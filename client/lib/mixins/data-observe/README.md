Data Change
===========

A React mixin that makes it easy to trigger re-rendering of a component when a `prop` emits a `change` event.


### Usage


```js
var observe = require( 'lib/mixins/data-observe' );

var Component = React.createClass({
	mixins: [ observe( 'sites', 'user' ) ]
});
```

([Read more about React mixins](http://facebook.github.io/react/docs/reusable-components.html#mixins).)
