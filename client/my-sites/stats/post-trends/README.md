PostTrends
=========
This module provides a React component to visualize frequency of posting in a GitHub-like calendar view

#### How to use:

```js
var PostTrends = require( 'post-trends' );

render: function() {
    return (
  		<PostTrends streakList={ streakList } />
    );
}
```

#### Required Props

* `streakList`: A `StatsList` object containing the parsed response to the streak api.