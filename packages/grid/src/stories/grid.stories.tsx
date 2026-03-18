import { useState } from 'react';
import { Grid } from '../grid';
import type { GridLayoutItem } from '../types';
import type { Meta, StoryObj } from '@storybook/react';
import type { HTMLAttributes } from 'react';

const meta: Meta< typeof Grid > = {
	title: 'Grid',
	component: Grid,
	tags: [ 'autodocs' ],
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		children: { control: false },
	},
};
export default meta;

function Card( {
	color,
	children,
	actionableArea,
	...props
}: {
	color: string;
	children: React.ReactNode;
	actionableArea?: React.ReactNode;
} & HTMLAttributes< HTMLDivElement > ) {
	return (
		<div
			{ ...props }
			style={ {
				backgroundColor: color,
				color: 'white',
				padding: '20px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				boxSizing: 'border-box',
				...props?.style,
			} }
		>
			{ children }
		</div>
	);
}

function WidgetActions( { onClose }: { onClose: () => void } ) {
	return (
		<div
			style={ {
				position: 'absolute',
				display: 'flex',
				alignItems: 'right',
				justifyContent: 'right',
				top: 2,
				right: 2,
				zIndex: 2,
			} }
		>
			<button onClick={ onClose }>x</button>
		</div>
	);
}

function LayoutStatePanel( { layout }: { layout: GridLayoutItem[] } ) {
	return (
		<div
			style={ {
				marginBottom: 16,
				padding: 12,
				background: '#f5f5f5',
				borderRadius: 4,
				fontFamily: 'monospace',
				fontSize: 12,
			} }
		>
			<strong>Layout state:</strong>
			<pre style={ { margin: '8px 0 0', whiteSpace: 'pre-wrap' } }>
				{ JSON.stringify( layout, null, 2 ) }
			</pre>
		</div>
	);
}

/**
 * Static grid with a fixed number of columns.
 *
 * **`columns=6`, no `minColumnWidth`**<br />
 *
 * The grid always renders exactly 6 columns regardless of container width.
 * Each item specifies a fixed `width` (column span).
 * Items that exceed the row are wrapped to the next one.
 */
export const Default: StoryObj< typeof Grid > = {
	args: {
		layout: [
			{ key: 'a', width: 1 },
			{ key: 'b', width: 3 },
			{ key: 'c', width: 2 },
			{ key: 'd', width: 4 },
			{ key: 'e', width: 2 },
		],
		columns: 6,
		children: [
			<Card key="a" color="#f44336">
				width: 1
			</Card>,
			<Card key="b" color="#2196f3">
				width: 3
			</Card>,
			<Card key="c" color="#4caf50">
				width: 2
			</Card>,
			<Card key="d" color="#ff9800">
				width: 4
			</Card>,
			<Card key="e" color="#9c27b0">
				width: 2
			</Card>,
		],
	},
};

/**
 * Responsive grid that adapts column count based on container width.
 *
 * **`minColumnWidth=192`, no fixed `columns`**<br />
 *
 * The grid computes effective columns as:
 *   `Math.floor((containerWidth + gap) / (minColumnWidth + gap))`
 *
 * Combines all three width modes:
 * - `width: N` — fixed column span
 * - `fillWidth` — fills remaining columns in the current row
 * - `fullWidth` — always spans all columns (grid-column: 1 / -1)
 * span as the effective column count changes.
 */
export const Responsive: StoryObj< typeof Grid > = {
	parameters: { layout: '' },
	args: {
		layout: [
			{ key: 'fill', fillWidth: true, height: 1, order: 1 },
			{ key: 'fixed-1', width: 1, height: 1, order: 2 },
			{ key: 'fixed-2', width: 2, height: 1, order: 3 },
			{ key: 'fixed-3', width: 2, height: 1, order: 4 },
			{ key: 'fixed-4', width: 2, height: 1, order: 5 },
			{ key: 'full', fullWidth: true, height: 1, order: 6 },
			{ key: 'fixed-5', width: 1, height: 1, order: 7 },
			{ key: 'fixed-6', width: 1, height: 1, order: 8 },
			{ key: 'fill-2', fillWidth: true, height: 1, order: 9 },
		],
		rowHeight: 96,
		minColumnWidth: 192,
		children: [
			<Card key="fill" color="#2196f3">
				fillWidth
			</Card>,
			<Card key="fixed-1" color="#4caf50">
				width: 1
			</Card>,
			<Card key="fixed-2" color="#f44336">
				width: 2
			</Card>,
			<Card key="fixed-3" color="#ff9800">
				width: 2
			</Card>,
			<Card key="fixed-4" color="#9c27b0">
				width: 2
			</Card>,
			<Card key="full" color="#607d8b">
				fullWidth
			</Card>,
			<Card key="fixed-5" color="#795548">
				width: 1
			</Card>,
			<Card key="fixed-6" color="#e91e63">
				width: 1
			</Card>,
			<Card key="fill-2" color="#00bcd4">
				fillWidth
			</Card>,
		],
	},
};

/**
 * Numeric row height with multi-row items.
 *
 * **`columns=6`, `rowHeight=80`**<br />
 *
 * When `rowHeight` is a number, items can span multiple rows via `height: N`.
 * The grid uses `gridAutoRows: 80px` and each item gets
 * `gridRow: span N` based on its `height`.
 */
export const RowHeight: StoryObj< typeof Grid > = {
	parameters: { layout: '' },
	args: {
		layout: [
			{ key: 'a', width: 2, height: 2, order: 1 },
			{ key: 'b', width: 2, height: 1, order: 2 },
			{ key: 'c', width: 2, height: 3, order: 3 },
			{ key: 'd', width: 4, height: 1, order: 4 },
			{ key: 'e', width: 2, height: 1, order: 5 },
		],
		columns: 6,
		rowHeight: 80,
		children: [
			<Card key="a" color="#f44336">
				2 cols x 2 rows
			</Card>,
			<Card key="b" color="#2196f3">
				2 cols x 1 row
			</Card>,
			<Card key="c" color="#4caf50">
				2 cols x 3 rows
			</Card>,
			<Card key="d" color="#ff9800">
				4 cols x 1 row
			</Card>,
			<Card key="e" color="#9c27b0">
				2 cols x 1 row
			</Card>,
		],
	},
};

/**
 * Auto row height — rows size to their content.
 *
 * **`minColumnWidth=128` (responsive mode), `rowHeight='auto'` (default)**<br />
 *
 * Rows grow to fit the tallest item. The `height` property has no
 * visual effect since there is no fixed row size to multiply.
 */
export const AutoRowHeight: StoryObj< typeof Grid > = {
	parameters: { layout: '' },
	args: {
		layout: [
			{ key: 'a', width: 2, order: 1 },
			{ key: 'b', width: 2, order: 2 },
			{ key: 'c', width: 2, order: 3 },
			{ key: 'd', width: 3, order: 4 },
			{ key: 'e', width: 3, order: 5 },
		],
		minColumnWidth: 128,
		rowHeight: 'auto',
		children: [
			<Card key="a" color="#f44336" style={ { minHeight: 60 } }>
				Short
			</Card>,
			<Card key="b" color="#2196f3" style={ { minHeight: 150 } }>
				Tall content pushes the row
			</Card>,
			<Card key="c" color="#4caf50" style={ { minHeight: 60 } }>
				Short
			</Card>,
			<Card key="d" color="#ff9800" style={ { minHeight: 80 } }>
				Medium
			</Card>,
			<Card key="e" color="#9c27b0" style={ { minHeight: 200 } }>
				Very tall
			</Card>,
		],
	},
};

/**
 * Comparison: hardcoded `width: 3` vs `fillWidth: true`.
 *
 * Both grids share the same layout state and have edit mode enabled.
 * The top grid simulates the CSS approach — the fill item has a
 * hardcoded `width: 3` (the equivalent of `grid-column: 2 / -3`
 * in 6 columns). The bottom grid uses `fillWidth: true`.
 *
 * Drag items to reorder or resize sidebars to see the difference:
 * the hardcoded grid breaks, the fillWidth grid adapts.
 */
export const FillWidthVsCss: StoryObj< typeof Grid > = {
	parameters: { layout: '' },
	render: function FillWidthVsCssStory() {
		const [ cssLayout, setCssLayout ] = useState< GridLayoutItem[] >( [
			{ key: 'left', width: 1, height: 1, order: 0 },
			{ key: 'fill', width: 3, height: 1, order: 1 },
			{ key: 'right', width: 2, height: 1, order: 2 },
		] );

		const [ fillLayout, setFillLayout ] = useState< GridLayoutItem[] >( [
			{ key: 'left', width: 1, height: 1, order: 0 },
			{ key: 'fill', fillWidth: true, height: 1, order: 1 },
			{ key: 'right', width: 2, height: 1, order: 2 },
		] );

		const label = {
			fontFamily: 'monospace',
			fontSize: 12,
			margin: '24px 0 8px',
			color: '#666',
		};

		const cssItems = Object.fromEntries( cssLayout.map( ( i ) => [ i.key, i ] ) );
		const fillItems = Object.fromEntries( fillLayout.map( ( i ) => [ i.key, i ] ) );

		return (
			<div style={ { width: '100%', maxWidth: 900 } }>
				<h3 style={ { fontFamily: 'sans-serif', fontSize: 14 } }>
					Hardcoded: width: 3 (equivalent to grid-column: 2 / -3)
				</h3>
				<p style={ label }>
					Drag or resize — the fill item stays at width: { cssItems.fill?.width ?? 3 }. It overflows
					or leaves gaps when siblings change.
				</p>
				<Grid
					layout={ cssLayout }
					columns={ 6 }
					rowHeight={ 80 }
					editMode
					onChangeLayout={ setCssLayout }
				>
					<Card key="left" color="#607d8b">
						left (w:{ cssItems.left?.width ?? 1 })
					</Card>
					<Card key="fill" color="#e53935">
						hardcoded w:{ cssItems.fill?.width ?? 3 }
					</Card>
					<Card key="right" color="#607d8b">
						right (w:{ cssItems.right?.width ?? 2 })
					</Card>
				</Grid>

				<h3 style={ { fontFamily: 'sans-serif', fontSize: 14, marginTop: 32 } }>
					fillWidth: computed dynamically
				</h3>
				<p style={ label }>
					Drag or resize — the fill item recalculates its span based on siblings and column count.
				</p>
				<Grid
					layout={ fillLayout }
					columns={ 6 }
					rowHeight={ 80 }
					editMode
					onChangeLayout={ setFillLayout }
				>
					<Card key="left" color="#607d8b">
						left (w:{ fillItems.left?.width ?? 1 })
					</Card>
					<Card key="fill" color="#2196f3">
						fillWidth — adapts
					</Card>
					<Card key="right" color="#607d8b">
						right (w:{ fillItems.right?.width ?? 2 })
					</Card>
				</Grid>
			</div>
		);
	},
};

/**
 * Static fillWidth without responsive behavior.
 *
 * **`columns=6`, no `minColumnWidth`**<br />
 *
 * Shows `fillWidth` and `fullWidth` in a fixed column grid.
 * Since there is no `minColumnWidth`, the column count never changes —
 * the fill span is always computed against 6 columns.
 */
export const FillWidthStatic: StoryObj< typeof Grid > = {
	parameters: { layout: '' },
	args: {
		layout: [
			{ key: 'fixed-a', width: 1, height: 1, order: 1 },
			{ key: 'fill', fillWidth: true, height: 1, order: 2 },
			{ key: 'fixed-b', width: 2, height: 1, order: 3 },
			{ key: 'full', fullWidth: true, height: 1, order: 4 },
			{ key: 'fixed-c', width: 2, height: 1, order: 5 },
			{ key: 'fill-2', fillWidth: true, height: 1, order: 6 },
		],
		columns: 6,
		rowHeight: 80,
		children: [
			<Card key="fixed-a" color="#607d8b">
				width: 1
			</Card>,
			<Card key="fill" color="#2196f3">
				fillWidth (3 cols)
			</Card>,
			<Card key="fixed-b" color="#f44336">
				width: 2
			</Card>,
			<Card key="full" color="#795548">
				fullWidth (6 cols)
			</Card>,
			<Card key="fixed-c" color="#ff9800">
				width: 2
			</Card>,
			<Card key="fill-2" color="#4caf50">
				fillWidth (4 cols)
			</Card>,
		],
	},
};

/**
 * Edit mode with drag, resize, and all width modes.
 *
 * **`columns=6`, `rowHeight=80`, `editMode=true`**<br />
 *
 * Includes `fillWidth`, `fullWidth`, and fixed items.
 * A state panel shows the raw layout JSON so you can observe
 * how resize affects items — particularly `fillWidth`/`fullWidth` items
 * where `width` gets a fixed value but the flag stays true.
 *
 * Drag items to reorder, resize from the bottom-right handle.
 * Use the close button (actionable area) to remove items.
 */
export const EditMode: StoryObj< typeof Grid > = {
	parameters: { layout: '' },
	render: function EditModeStory() {
		const [ layout, setLayout ] = useState< GridLayoutItem[] >( [
			{ key: 'fill', fillWidth: true, height: 1, order: 1 },
			{ key: 'fixed-1', width: 1, height: 1, order: 2 },
			{ key: 'fixed-2', width: 5, height: 1, order: 3 },
			{ key: 'full', fullWidth: true, height: 1, order: 4 },
			{ key: 'fixed-3', width: 2, height: 1, order: 5 },
			{ key: 'fixed-4', width: 2, height: 1, order: 6 },
		] );

		const removeTile = ( key: string ) => {
			setLayout( layout.filter( ( item ) => item.key !== key ) );
		};

		return (
			<div style={ { width: '800px' } }>
				<Grid
					layout={ layout }
					columns={ 6 }
					rowHeight={ 80 }
					spacing={ 2 }
					editMode
					onChangeLayout={ setLayout }
				>
					<Card
						key="fill"
						color="#2196f3"
						actionableArea={ <WidgetActions onClose={ () => removeTile( 'fill' ) } /> }
					>
						fillWidth — resize me
					</Card>
					<Card
						key="fixed-1"
						color="#4caf50"
						actionableArea={ <WidgetActions onClose={ () => removeTile( 'fixed-1' ) } /> }
					>
						width: 1
					</Card>
					<Card
						key="fixed-2"
						color="#f44336"
						actionableArea={ <WidgetActions onClose={ () => removeTile( 'fixed-2' ) } /> }
					>
						width: 2
					</Card>
					<Card
						key="full"
						color="#607d8b"
						actionableArea={ <WidgetActions onClose={ () => removeTile( 'full' ) } /> }
					>
						fullWidth — resize me
					</Card>
					<Card
						key="fixed-3"
						color="#ff9800"
						actionableArea={ <WidgetActions onClose={ () => removeTile( 'fixed-3' ) } /> }
					>
						width: 2
					</Card>
					<Card
						key="fixed-4"
						color="#9c27b0"
						actionableArea={ <WidgetActions onClose={ () => removeTile( 'fixed-4' ) } /> }
					>
						width: 2
					</Card>
				</Grid>

				<LayoutStatePanel layout={ layout } />
			</div>
		);
	},
};
