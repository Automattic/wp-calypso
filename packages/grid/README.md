# Grid

A flexible grid component for React applications. This component uses CSS Grid to create layouts with precise control over the positioning of elements.

## Installation

```bash
yarn add @automattic/grid
```

## Usage

```jsx
import { Grid } from '@automattic/grid';

const MyLayout = () => {
	const layout = [
		{ key: 'a', x: 0, y: 0, width: 1 },
		{ key: 'b', x: 1, y: 0, width: 3 },
		{ key: 'c', x: 4, y: 0, width: 1 },
	];

	return (
		<Grid layout={ layout } columns={ 6 }>
			<div key="a">a</div>
			<div key="b">b</div>
			<div key="c">c</div>
		</Grid>
	);
};
```

## API

### `Grid` Component

The main component exported by this package.

#### Props

- `layout` (required): An array of layout items with the following properties:
  - `key` (string): A unique identifier that matches the `key` prop of the corresponding child component
  - `x` (number): The starting column (0-indexed)
  - `y` (number): The starting row (0-indexed)
  - `width` (number): The number of columns this item spans
  - `height` (number, optional): The number of rows this item spans (defaults to 1)
- `columns` (required): Total number of columns in the grid
- `className` (optional): Additional CSS class to apply to the grid container
- `spacing` (optional): Grid gap multiplier size, defaults to 2 (e.g. A spacing of 2 results in a gap of 8px, it's multiplied by 4)
- `rowHeight` (optional): Height of each row (e.g., "50px", "auto")
