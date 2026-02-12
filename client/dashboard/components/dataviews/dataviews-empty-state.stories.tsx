import { Meta, StoryObj } from '@storybook/react';
import { Button } from '@wordpress/components';
import { DataViewsEmptyState } from './dataviews-empty-state';

const meta: Meta< typeof DataViewsEmptyState > = {
	title: 'client/dashboard/DataViewsEmptyState',
	component: DataViewsEmptyState,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ],
};

export default meta;
type Story = StoryObj< typeof DataViewsEmptyState >;

export const Default: Story = {
	args: {
		title: 'No cats found',
		description: 'Create a new cat before it will appear here.',
		actions: (
			<Button __next40pxDefaultSize variant="primary">
				Create new cat
			</Button>
		),
		illustration: (
			<img
				src="https://live.staticflickr.com/3277/2938134470_c807dc3e47_b.jpg"
				alt=""
				width="300px"
			/>
		),
	},
};
