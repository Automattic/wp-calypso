Stats Pagination
================
This component provides a way to paginate a resultset.

#### How to use:

```js
var Pagination = require( 'my-sites/stats/pagination' );

render: function() {
    return (
		<Pagination page={ <Number> } perPage={ <Number> } total={ <Number> } pageClick={ <Function> } />;	
    );
}
```

#### Required Props

* `page`: The current active page number
* `perPage`: Number of records shown per page
* `total`: Total number of records
* `pageClick`: Function called when a pagination item is clicked - the page clicked is provided as an argument