import { Grid } from '../grid';
import type { Meta, StoryObj } from '@storybook/react';

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
	style,
	color,
	children,
}: {
	style?: React.CSSProperties;
	color: string;
	children: React.ReactNode;
} ) {
	return (
		<div
			key="a"
			style={ {
				backgroundColor: color,
				color: 'white',
				padding: '20px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				...style,
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
		rowHeight: '100px',
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
