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
 * Interactive grid example showing dynamic layout changes.
 * Add, remove, and switch layouts on the fly. Enable edit mode to drag and resize tiles.
 */
export const InteractiveGrid: StoryObj< typeof Grid > = {
	render: function InteractiveGrid() {
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
		const [ editMode, setEditMode ] = useState( false );

		const addTile = () => {
			const newLayout = [ ...layout, { key: `tile-${ nextTileId }`, width: 2, height: 1 } ];
			setLayout( newLayout );
			setNextTileId( nextTileId + 1 );
		};

		const removeTile = ( key: string ) => {
			setLayout( layout.filter( ( item ) => item.key !== key ) );
		};

		const switchLayout = () => {
			if ( currentLayoutName === 'A' ) {
				setLayout( layoutB );
				setCurrentLayoutName( 'B' );
				setNextTileId( 4 );
			} else {
				setLayout( layoutA );
				setCurrentLayoutName( 'A' );
				setNextTileId( 4 );
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
					<h3 style={ { marginTop: 0 } }>Grid Controls</h3>
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
						<button
							onClick={ () => setEditMode( ! editMode ) }
							style={ {
								padding: '8px 16px',
								background: editMode ? '#ff9800' : '#666',
								color: 'white',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
							} }
						>
							{ editMode ? 'Disable' : 'Enable' } Edit Mode
						</button>
					</div>
					<div style={ { fontSize: '14px', color: '#666' } }>
						<strong>Layout:</strong> { currentLayoutName } | <strong>Tiles:</strong>{ ' ' }
						{ layout.length } | <strong>Edit Mode:</strong> { editMode ? 'ON' : 'OFF' }
					</div>
				</div>
				<Grid
					layout={ layout }
					minColumnWidth={ 160 }
					rowHeight={ 100 }
					spacing={ 2 }
					editMode={ editMode }
					onChangeLayout={ setLayout }
				>
					{ layout.map( ( item ) => {
						const tileNum = getTileNumber( item.key );
						const colorIndex = tileNum % colors.length;
						return (
							<Card
								key={ item.key }
								color={ colors[ colorIndex ] }
								actionableArea={
									editMode ? <WidgetActions onClose={ () => removeTile( item.key ) } /> : undefined
								}
							>
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
					'Interactive example showing dynamic layout management. Add tiles, switch between predefined layouts, and enable edit mode to drag and resize tiles. Each tile has a close button to remove it individually.',
			},
		},
		layout: '',
	},
};
