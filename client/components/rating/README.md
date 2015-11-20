Rating
======

This component is used to display a set of 5 stars, full colored, empty or half-colored,
that represents a rating in a scale between 0 and 5.

#### How to use:

```js
var Rating = require( 'components/rating' );

render: function() {
	return (
		<Rating
			rating={ 65 }
			size={ 50 }
		/>
	);
}
```

#### Props

* `rating`: Number - A number with the 0-100 rating to render

* `size`: **optional** Number - `font-size` value in pixels. If it isn't
  defined font-size will be set to `inherit`
