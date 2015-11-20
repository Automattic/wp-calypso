Post Performance
====================
This component creates an insights card that displays stats about the last post published for a site.


#### How to use:

```js
var PostPerformance = require( 'my-sites/stats/post-performance' );

render: function() {
    return (
  		<PostPerformance site={ <Object> } />
    );
}
```

#### Required Props

* `site`: A Site Object