import { Meta, StoryObj } from '@storybook/react';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { Callout } from './';

const meta: Meta< typeof Callout > = {
	title: 'client/dashboard/Callout',
	component: Callout,
	tags: [ 'autodocs' ],
};

export default meta;
type Story = StoryObj< typeof Callout >;

export const Default: Story = {
	args: {
		title: 'Let our WordPress.com experts build your site!',
		description: (
			<Text as="p" variant="muted">
				Hire our dedicated experts to build a handcrafted, personalized website. Share some details
				about what you’re looking for, and we’ll make it happen.
			</Text>
		),
		actions: (
			<Button __next40pxDefaultSize variant="primary">
				Get started
			</Button>
		),
		image: 'https://live.staticflickr.com/3277/2938134470_c807dc3e47_b.jpg',
		imageAlt: 'Sweet eyed kitty',
	},
};
