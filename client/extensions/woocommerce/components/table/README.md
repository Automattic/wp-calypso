# Table

Table is a component used to display tabular data. It is used to render semantic HTML table markup while handling accessibility. More information on accessible tables [here](http://webaim.org/techniques/tables/data).

The `compact` prop applies styling for a more compact table. It also allows for a column to occupy the largest space available by including the prop `isTitle` on a `TableItem`. Contents of the cell will have overflow faded to white.

![screen shot 2017-06-13 at 11 42 53 am](https://user-images.githubusercontent.com/1922453/27059946-c1ff77f6-502d-11e7-9af5-aaecd09bb335.png)

## How to use

```js
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

function render() {
	const titles = (
		<TableRow isHeader>
			{ [ 'One', 'Two', 'Three' ].map( ( item, i ) => (
				<TableItem isHeader key={ i } isTitle={ 0 === i }>
					{ item }
				</TableItem>
			) ) }
		</TableRow>
	);
	const values = [
		[ 1, 2, 3 ],
		[ 4, 5, 6 ],
		[ 7, 8, 9 ],
	];
	return (
		<Table header={ titles } compact>
			{ values.map( ( row, i ) => (
				<TableRow key={ i }>
					{ row.map( ( item, j ) => (
						<TableItem key={ j } isTitle={ 0 === j }>
							{ item }
						</TableItem>
					) ) }
				</TableRow>
			) ) }
		</Table>
	);
}
```

## Props `<Table/>`

- `header`: A `<TableRow />` element used to define the table's head.
- `className`: Classes added to top level element.
- `compact`: Denotes a more compact table.

## Props `<TableRow/>`

- `className`: Classes added to top level element.
- `isHeader`: Establishes row as being used for table head.
- `href`: Optional link, if set, the row becomes clickable/focusable.

## Props `<TableItem/>`

- `alignRight`: Apply `text-align: right` on an item.
- `className`: Classes added to top level element.
- `isHeader`: Establishes item as being a column header.
- `isRowHeader`: Establishes item as being a row header.
- `isTitle`: Used to specify a main cell occupying the maximum available space in `compact` mode.
