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
  - `order` (number, optional): In responsive mode, determines the order of items (lower values displayed first)
  - `fullWidth` (boolean, optional): In responsive mode, forces an item to always span all available columns
- `columns` (required): Total number of columns in the grid
- `className` (optional): Additional CSS class to apply to the grid container
- `spacing` (optional): Grid gap multiplier size, defaults to 2 (e.g. A spacing of 2 results in a gap of 8px, it's multiplied by 4)
- `rowHeight` (optional): Height of each row (e.g., "50px", "auto")
- `minColumnWidth` (optional): Minimum width in pixels for each column; when provided, enables responsive mode that automatically adjusts columns based on container width

## Fixed vs. Responsive Mode

The Grid component can operate in two modes:

### Fixed Mode (Default)

In fixed mode, items are positioned exactly according to their `x` and `y` coordinates in the layout. This provides precise control over the grid layout.

```jsx
// Fixed layout with 6 columns
<Grid
	layout={ [
		{ key: 'a', x: 0, y: 0, width: 2 },
		{ key: 'b', x: 2, y: 0, width: 4 },
	] }
	columns={ 6 }
>
	<div key="a">Item A</div>
	<div key="b">Item B</div>
</Grid>
```

### Responsive Mode

When `minColumnWidth` is provided, the Grid activates responsive mode, which automatically adjusts the number of columns based on the container width. In this mode:

1. Items flow according to their `order` property (or original array order if not specified)
2. The grid will collapse to fewer columns when the container width can't accommodate `columns` columns of `minColumnWidth` each
3. Items that can't fit on a row will wrap to the next row
4. Items with `fullWidth` set to `true` will always span all available columns

```jsx
// Responsive layout that adapts to container width
<Grid
	layout={ [
		{ key: 'a', width: 2, order: 1 },
		{ key: 'b', width: 2, order: 2 },
		{ key: 'c', width: 4, order: 3, fullWidth: true },
	] }
	columns={ 6 }
	minColumnWidth={ 150 } // Each column should be at least 150px
>
	<div key="a">Item A</div>
	<div key="b">Item B</div>
	<div key="c">Item C (always full width)</div>
</Grid>
```
