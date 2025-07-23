import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';

const meta = {
	title: 'Primitives/Button',
	component: Button,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'primary',
				'secondary',
				'tertiary',
				'outline',
				'link',
				'icon',
			],
		},
		size: {
			control: 'select',
			options: [ 'sm', 'xxs', 'icon' ],
		},
		disabled: {
			control: 'boolean',
		},
		onClick: { action: 'clicked' },
	},
} satisfies Meta< typeof Button >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		children: 'Button',
	},
};

export const Primary: Story = {
	args: {
		variant: 'primary',
		children: 'Primary Button',
	},
};

export const Secondary: Story = {
	args: {
		variant: 'secondary',
		children: 'Secondary Button',
	},
};

export const Tertiary: Story = {
	args: {
		variant: 'tertiary',
		children: 'Tertiary Button',
	},
};

export const Outline: Story = {
	args: {
		variant: 'outline',
		children: 'Outline Button',
	},
};

export const Link: Story = {
	args: {
		variant: 'link',
		children: 'Link Button',
	},
};

export const WithIcon: Story = {
	args: {
		variant: 'primary',
		icon: <ArrowUpIcon />,
		children: 'Send',
	},
};

export const IconOnly: Story = {
	args: {
		variant: 'icon',
		size: 'icon',
		children: <ArrowUpIcon />,
	},
};

export const Disabled: Story = {
	args: {
		variant: 'primary',
		disabled: true,
		children: 'Disabled Button',
	},
};

export const AllVariants: Story = {
	render: () => (
		<div
			style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }
		>
			<div
				style={ {
					display: 'flex',
					gap: '0.5rem',
					alignItems: 'center',
				} }
			>
				<Button variant="primary">Primary</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="tertiary">Tertiary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="link">Link</Button>
				<Button variant="icon" size="icon">
					<ArrowUpIcon />
				</Button>
			</div>
			<div
				style={ {
					display: 'flex',
					gap: '0.5rem',
					alignItems: 'center',
				} }
			>
				<Button variant="primary" disabled>
					Primary Disabled
				</Button>
				<Button variant="secondary" disabled>
					Secondary Disabled
				</Button>
				<Button variant="tertiary" disabled>
					Tertiary Disabled
				</Button>
			</div>
		</div>
	),
};

export const Interactive: Story = {
	args: {
		variant: 'primary',
		children: 'Click Me!',
		onClick: () => {
			console.log( 'Button clicked!' );
		},
	},
	play: async ( { canvasElement } ) => {
		const { within, userEvent } = await import( '@storybook/test' );
		const canvas = within( canvasElement );

		const button = canvas.getByRole( 'button' );
		await userEvent.hover( button );

		await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );
		await userEvent.unhover( button );
	},
};
