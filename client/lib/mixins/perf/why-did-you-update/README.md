Why did you update
==================

A React mixin that check if a component update was really required.

Drop this mixin into a component that wastes time according to Perf.getWastedTime() to find
out what state/props should be preserved. Once it says "Update avoidable!" for {state, props},
you should be able to drop in React.addons.PureRenderMixin

```js
var WhyDidYouUpdateMixin = require( 'lib/mixins/perf/why-did-you-update' );

var MyComponent = React.createClass({
	mixins: [ WhyDidYouUpdateMixin ]
});
```

([Read more about React Performance and the source of this mixin (Saif Hakim)](http://benchling.engineering/deep-dive-react-perf-debugging/).)
