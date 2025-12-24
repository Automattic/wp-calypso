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

/**
 * Basic usage example of the Grid component
 */
export const Default: StoryObj< typeof Grid > = {
	args: {
		layout: [
			{ key: 'a', width: 1 },
			{ key: 'b', width: 3 },
			{ key: 'c', width: 1 },
		],
		columns: 6,
		children: [
			<Card key="a" color="#f44336">
				A
			</Card>,
			<Card key="b" color="#2196f3">
				B
			</Card>,
			<Card key="c" color="#4caf50">
				C
			</Card>,
		],
	},
};

/**
 * Responsive grid that reflows based on container width.
 * Resize the storybook window to see it in action.
 */
export const ResponsiveGrid: StoryObj< typeof Grid > = {
	args: {
		layout: [
			{ key: 'a', width: 2, height: 1, order: 1 },
			{ key: 'b', width: 2, height: 1, order: 2 },
			{ key: 'c', width: 2, height: 1, order: 3 },
			{ key: 'd', width: 4, height: 1, order: 4 },
			{ key: 'e', width: 2, height: 1, order: 5 },
			{ key: 'f', height: 2, order: 6, fullWidth: true },
		],
		rowHeight: 'auto',
		minColumnWidth: 160,
		children: [
			<Card key="a" color="#f44336">
				Card A
			</Card>,
			<Card key="b" color="#2196f3">
				Card B
			</Card>,
			<Card key="c" color="#4caf50">
				Card C
			</Card>,
			<Card key="d" color="#ff9800">
				Card D
			</Card>,
			<Card key="e" color="#9c27b0">
				Card E
			</Card>,
			<Card key="f" color="#607d8b">
				Full Width Card F
			</Card>,
		],
	},
	parameters: {
		docs: {
			description: {
				story:
					'This example demonstrates the responsive behavior of the Grid component. The grid will automatically adjust the number of columns based on the container width. Resize the browser window to see it in action.',
			},
		},
		layout: '',
	},
};

/**
 * Example showing the Grid component in edit mode with drag and drop functionality
 */
export const EditableGrid: StoryObj< typeof Grid > = {
	render: function EditableGrid() {
		const [ layout, setLayout ] = useState< GridLayoutItem[] >( [
			{ key: 'a', width: 1, height: 1 },
			{ key: 'b', width: 2, height: 1 },
			{ key: 'c', width: 1, height: 1 },
			{ key: 'd', width: 2, height: 1 },
			{ key: 'e', width: 1, height: 1 },
			{ key: 'f', width: 1, height: 1 },
			{ key: 'g', width: 2, height: 1 },
			{ key: 'h', width: 1, height: 1 },
			{ key: 'i', width: 1, height: 1 },
			{ key: 'j', width: 1, height: 1 },
		] );

		return (
			<Grid
				layout={ layout }
				minColumnWidth={ 160 }
				rowHeight={ 100 }
				spacing={ 2 }
				editMode
				onChangeLayout={ ( newLayout ) => setLayout( newLayout ) }
			>
				<Card key="a" color="#f44336">
					Card A
				</Card>
				<Card key="b" color="#2196f3">
					Card B
				</Card>
				<Card key="c" color="#4caf50">
					Card C
				</Card>
				<Card key="d" color="#ff9800">
					Card D
				</Card>
				<Card key="e" color="#9c27b0">
					Card E
				</Card>
				<Card key="f" color="#607d8b">
					Card F
				</Card>
				<Card key="g" color="#3f51b5">
					Card G
				</Card>
				<Card key="h" color="#8bc34a">
					Card H
				</Card>
				<Card key="i" color="#cddc39">
					Card I
				</Card>
				<Card key="j" color="#ffeb3b">
					Card J
				</Card>
			</Grid>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'This example demonstrates the Grid component in edit mode with drag, drop, and resize functionality. Use the edit mode to reorder and resize the cards. Grab and drag the handle in the bottom-right corner of each card to resize it. The layout and edit mode are managed with local state.',
			},
		},
		layout: '',
	},
};

/**
 * Example showing the Grid component with actionable area
 */
export const WithActionableArea: StoryObj< typeof Grid > = {
	render: function EditableGrid() {
		const [ layout, setLayout ] = useState< GridLayoutItem[] >( [
			{ key: 'a', width: 1, height: 1 },
			{ key: 'b', width: 2, height: 1 },
			{ key: 'c', width: 1, height: 1 },
			{ key: 'd', width: 2, height: 1 },
			{ key: 'e', width: 1, height: 1 },
			{ key: 'f', width: 1, height: 1 },
			{ key: 'g', width: 2, height: 1 },
			{ key: 'h', width: 1, height: 1 },
			{ key: 'i', width: 1, height: 1 },
			{ key: 'j', width: 1, height: 1 },
		] );

		return (
			<Grid
				layout={ layout }
				minColumnWidth={ 160 }
				rowHeight={ 100 }
				spacing={ 2 }
				editMode
				onChangeLayout={ ( newLayout ) => setLayout( newLayout ) }
			>
				<Card
					key="a"
					color="#f44336"
					actionableArea={
						<WidgetActions
							onClose={ () => {
								// eslint-disable-next-line no-console
								console.log( 'close card A' );
							} }
						/>
					}
				>
					Card A
				</Card>
				<Card key="b" color="#2196f3">
					Card B
				</Card>
				<Card
					key="c"
					color="#4caf50"
					actionableArea={
						<WidgetActions
							onClose={ () => {
								// eslint-disable-next-line no-console
								console.log( 'close card C' );
							} }
						/>
					}
				>
					Card C
				</Card>
				<Card key="d" color="#ff9800">
					Card D
				</Card>
				<Card key="e" color="#9c27b0">
					Card E
				</Card>
				<Card key="f" color="#607d8b">
					Card F
				</Card>
				<Card key="g" color="#3f51b5">
					Card G
				</Card>
				<Card
					key="h"
					color="#8bc34a"
					actionableArea={
						<WidgetActions
							onClose={ () => {
								// eslint-disable-next-line no-console
								console.log( 'close card H' );
							} }
						/>
					}
				>
					Card H
				</Card>
				<Card key="i" color="#cddc39">
					Card I
				</Card>
				<Card key="j" color="#ffeb3b">
					Card J
				</Card>
			</Grid>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'This example demonstrates how to add actionable areas to grid items that remain interactive during edit mode.',
			},
		},
		layout: '',
	},
};

/**
 * Demonstrates the bug where Grid tiles don't re-render when layout prop changes dynamically.
 * This story shows the issue described in ARC-1330.
 *
 * BUG: When you add, remove, or switch layouts, the Grid doesn't update properly.
 * Expected: Tiles should appear/disappear/change immediately
 * Actual: Grid retains old tile instances
 *
 * Current workaround: Use a `key` prop on Grid to force re-mount when layout changes
 */
export const DynamicLayoutChange: StoryObj< typeof Grid > = {
	render: function DynamicLayoutChange() {
		const colors = [
			'#f44336',
			'#2196f3',
			'#4caf50',
			'#ff9800',
			'#9c27b0',
			'#607d8b',
			'#3f51b5',
			'#8bc34a',
			'#cddc39',
			'#ffeb3b',
		];

		const layoutA: GridLayoutItem[] = [
			{ key: 'tile-1', width: 2, height: 1 },
			{ key: 'tile-2', width: 2, height: 1 },
			{ key: 'tile-3', width: 2, height: 1 },
		];

		const layoutB: GridLayoutItem[] = [
			{ key: 'tile-a', width: 3, height: 1 },
			{ key: 'tile-b', width: 3, height: 1 },
		];

		const [ layout, setLayout ] = useState< GridLayoutItem[] >( layoutA );
		const [ currentLayoutName, setCurrentLayoutName ] = useState( 'A' );
		const [ nextTileId, setNextTileId ] = useState( 4 );

		const addTile = () => {
			const newLayout = [ ...layout, { key: `tile-${ nextTileId }`, width: 2, height: 1 } ];
			setLayout( newLayout );
			setNextTileId( nextTileId + 1 );
		};

		const removeLastTile = () => {
			if ( layout.length > 0 ) {
				setLayout( layout.slice( 0, -1 ) );
			}
		};

		const switchLayout = () => {
			if ( currentLayoutName === 'A' ) {
				setLayout( layoutB );
				setCurrentLayoutName( 'B' );
			} else {
				setLayout( layoutA );
				setCurrentLayoutName( 'A' );
			}
		};

		const getTileNumber = ( key: string ) => {
			const match = key.match( /\d+/ );
			return match ? parseInt( match[ 0 ], 10 ) : key.charCodeAt( key.length - 1 ) - 96;
		};

		return (
			<div style={ { width: '800px' } }>
				<div
					style={ {
						marginBottom: '20px',
						padding: '20px',
						background: '#f5f5f5',
						borderRadius: '4px',
					} }
				>
					<h3 style={ { marginTop: 0 } }>Layout Controls</h3>
					<div style={ { display: 'flex', gap: '10px', marginBottom: '15px' } }>
						<button
							onClick={ addTile }
							style={ {
								padding: '8px 16px',
								background: '#2196f3',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							} }
						>
							Add Tile
						</button>
						<button
							onClick={ removeLastTile }
							disabled={ layout.length === 0 }
							style={ {
								padding: '8px 16px',
								background: layout.length === 0 ? '#ccc' : '#f44336',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: layout.length === 0 ? 'not-allowed' : 'pointer',
							} }
						>
							Remove Last Tile
						</button>
						<button
							onClick={ switchLayout }
							style={ {
								padding: '8px 16px',
								background: '#4caf50',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							} }
						>
							Switch to Layout { currentLayoutName === 'A' ? 'B' : 'A' }
						</button>
					</div>
					<div style={ { fontSize: '14px', color: '#666' } }>
						<strong>Current Layout:</strong> { currentLayoutName } | <strong>Tiles:</strong>{ ' ' }
						{ layout.length }
					</div>
					<div
						style={ {
							marginTop: '10px',
							padding: '10px',
							background: '#fff3cd',
							borderRadius: '4px',
							fontSize: '13px',
						} }
					>
						<strong>BUG:</strong> When you add/remove tiles or switch layouts, the Grid doesn't
						update properly. The tiles remain from the previous layout state.
					</div>
				</div>
				<Grid layout={ layout } minColumnWidth={ 160 } rowHeight={ 100 } spacing={ 2 }>
					{ layout.map( ( item ) => {
						const tileNum = getTileNumber( item.key );
						const colorIndex = tileNum % colors.length;
						return (
							<Card key={ item.key } color={ colors[ colorIndex ] }>
								{ item.key }
							</Card>
						);
					} ) }
				</Grid>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					"This story demonstrates the bug where Grid tiles don't re-render when the layout prop changes dynamically. Try adding tiles, removing tiles, or switching between layouts - you'll see that the Grid doesn't update correctly. This is the issue described in ARC-1330.",
			},
		},
		layout: '',
	},
};
