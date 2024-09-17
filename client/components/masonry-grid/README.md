# MasonryGrid

`<MasonryGrid />` is a React component for rendering a Masonry layout.<br />
It's not a real Masonry, since it's based on HTML Grid and all items just moved to the items above of them. So it's simple solution which doesn't take a lot of code, unlike existing heavy npm-libraries. And also it's cross-browsers solution, unlike CSS multi-column, which is still notoriously buggy.

## Usage
```jsx
import { MasonryGrid } from 'calypso/components/masonry-grid';
 
export default function MyComponent() {
	return (
		<MasonryGrid className="masonry-grid-example">
			<div className="masonry-grid-example__item">1</div>
			<div className="masonry-grid-example__item">2</div>
			<div className="masonry-grid-example__item">3</div>
			<div className="masonry-grid-example__item">4</div>
		</MasonryGrid>
	);
}

```

By default it renders 2 columns, but you can easily customize it with the help of CSS. e.g.
```
.masonry-grid-example {
	@include break-medium {
		grid-template-columns: repeat(3, 1fr);
	}

	@include break-huge {
		grid-template-columns: repeat(4, 1fr);
	}
}
```

## Props

The following props can be passed to the `<SpinnerLine />` component:

| property    | type   | required | default | comment                                                                                              |
| ----------- | ------ | -------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `className` | String | no       | `null`  | A custom class name to apply to the rendered element, in addition to the base `.masonry-grid__wrapper` class. |
