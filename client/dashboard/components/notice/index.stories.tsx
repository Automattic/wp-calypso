import { Meta, StoryObj } from '@storybook/react';
import { Button, ExternalLink } from '@wordpress/components';
import Notice from './index';

const meta = {
	title: 'client/dashboard/Notice',
	component: Notice,
	tags: [ 'autodocs' ],
	argTypes: {
		density: {
			control: { type: 'radio' },
			options: [ 'low', 'medium', 'high' ],
		},
		variant: {
			control: { type: 'radio' },
			options: [ 'info', 'warning', 'success', 'error' ],
		},
	},
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
} satisfies Meta< typeof Notice >;

export default meta;
type Story = StoryObj< typeof meta >;

const defaultArgs = {
	title: 'Title',
	description: (
		<>
			Hello, I’m a notice with an inline <ExternalLink>link</ExternalLink>.
		</>
	),
	actions: (
		<>
			<Button variant="primary">Label</Button>
			<Button variant="secondary">Label</Button>
			<Button variant="link">Label</Button>
		</>
	),
};

export const Default: Story = {
	args: {
		...defaultArgs,
	},
};

export const IsInfo: Story = {
	args: {
		...defaultArgs,
		variant: 'info',
	},
};

export const IsWarning: Story = {
	args: {
		...defaultArgs,
		variant: 'warning',
	},
};

export const IsSuccess: Story = {
	args: {
		...defaultArgs,
		variant: 'success',
	},
};

export const IsError: Story = {
	args: {
		...defaultArgs,
		variant: 'error',
	},
};

export const hasLowDensity: Story = {
	args: {
		...defaultArgs,
		density: 'low',
	},
};

export const hasMediumDensity: Story = {
	args: {
		...defaultArgs,
		density: 'medium',
	},
};

export const hasHighDensity: Story = {
	args: {
		...defaultArgs,
		density: 'high',
	},
};

export const WithoutActions: Story = {
	args: {
		...defaultArgs,
		actions: undefined,
	},
};

export const NotDismissible: Story = {
	args: {
		...defaultArgs,
		isDismissible: false,
	},
};
