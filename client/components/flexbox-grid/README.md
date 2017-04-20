FlexboxGrid
===========

A SSR compatible drop-in replacement for *Grid* and *AutoSizer* components from [react-virtualized](https://github.com/bvaughn/react-virtualized).  
The grid is initially rendered as a static flexbox layout and switches to virtual scroll once it is given its dimensions. The measuring itself is the responsibility of the parent component.

### PropTypes

| Property | Type | Required? | Description |
|:---|:---|:---|:---|
| width | Number |  | The total width of the grid component. This is necessery for the component to switch to virtual scroll. |
| maxColumnWidth | Number | ✓ | The minimum column width. Used for cells flex-base. |
| columnCount | Number | ✓ | The number of columns in a row. Used only for determining currently visible cells. Doesn't affect the view. |
| rowHeight | Number |  | Used to determine the total height of the grid. |
| rowCount | Number | ✓ | The number of rows in the grid. Used only for determining currently visible cells. Doesn't affect the view. |
| scrollTop | Number |  | Scroll position relative to the top of the grid. Used for determining currently visible cells. |
| cellRenderer | Function | ✓ | Responsible for rendering a cell given its index. Should implement the following signature: `({ index: number, key: number, style: object }): React.Component`. |
| overscanRowCount | Number |  | Number of rows to render above & below the visible slice of the grid. Helps reduce flickering during scrolling. Default: 0. |
| onCellsRendered | Function |  | Callback invoked each time the visible rows change. `({ startIndex: Number, stopIndex: Number }): void` |

**Important:** When providing a **width** property, **rowHeight** and **scrollTop** must also be provided for virtual scrolling to work.

Cell inices start from `0` and go from left to right and from top to bottom.

### Example

```js
const items = [
	...
];


const MyComponent = () => {
	const renderCell = ( { index, key, style } => {
		return (
			<div key={ key } style={ style }>{ index }</div>
		);
	} );

	return {
		<WindowScroller>
			{ ( { scrollTop } ) => (
				<FlexboxGrid
					width={ 1000 }
					minColumnWidth={ 200 }
					columnCount={ 4 }
					rowCount={ items.length / 4 }
					scrollTop={ scrollTop }
					cellRenderer={ renderCell }
					overscanRowCount={ 3 }
				/>
			) }
		</WindowScroller>
	};	
};
```
