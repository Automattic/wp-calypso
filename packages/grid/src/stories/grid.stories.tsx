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
	...props
}: { color: string; children: React.ReactNode } & HTMLAttributes< HTMLDivElement > ) {
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
