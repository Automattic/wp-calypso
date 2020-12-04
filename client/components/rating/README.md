# Rating

This component is used to display a set of 5 stars, full colored, empty or half-colored,
that represents a rating in a scale between 0 and 5.

## How to use

```js
import Rating from 'calypso/components/rating';

function render() {
	return <Rating rating={ 65 } size={ 48 } />;
}
```

## Props

- `rating`: Number - A number with the 0-100 rating to render

- `size`: **optional** Number - icon height in pixels. If it isn't
  defined size will be set to 24px.
