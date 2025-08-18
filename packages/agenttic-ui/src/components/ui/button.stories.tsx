import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';

const meta: Meta< typeof Button > = {
	title: 'Primitives/Button',
	component: Button,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		variant: {
			control: 'select',
			options: [ 'primary', 'ghost', 'outline', 'link' ],
		},
		size: {
			control: 'select',
			options: [ 'sm', 'icon' ],
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

export const Ghost: Story = {
	args: {
		variant: 'ghost',
		children: 'Ghost Button',
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
		variant: 'ghost',
		icon: <ArrowUpIcon />,
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
				<Button variant="ghost">Ghost</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="link">Link</Button>
				<Button variant="ghost" icon={ <ArrowUpIcon /> } />
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
				<Button variant="ghost" disabled>
					Ghost Disabled
				</Button>
			</div>
		</div>
	),
};

export const IconVariations: Story = {
	name: 'Icon Usage Patterns',
	render: () => (
		<div
			style={ { display: 'flex', flexDirection: 'column', gap: '2rem' } }
		>
			<div>
				<h4
					style={ {
						margin: '0 0 1rem',
						fontSize: '14px',
						fontWeight: '600',
					} }
				>
					Auto-sizing
				</h4>
				<div
					style={ {
						display: 'flex',
						gap: '1rem',
						alignItems: 'center',
					} }
				>
					<div style={ { textAlign: 'center' } }>
						<Button variant="primary" icon={ <ArrowUpIcon /> } />
						<p
							style={ {
								fontSize: '12px',
								margin: '8px 0 0',
								color: '#666',
							} }
						>
							Icon only → auto size=&quot;icon&quot;
						</p>
					</div>
					<div style={ { textAlign: 'center' } }>
						<Button variant="primary" icon={ <ArrowUpIcon /> }>
							Send
						</Button>
						<p
							style={ {
								fontSize: '12px',
								margin: '8px 0 0',
								color: '#666',
							} }
						>
							Icon + text → default size
						</p>
					</div>
				</div>
			</div>
			<div>
				<h4
					style={ {
						margin: '0 0 1rem',
						fontSize: '14px',
						fontWeight: '600',
					} }
				>
					Icon-only variants
				</h4>
				<div
					style={ {
						display: 'flex',
						gap: '0.5rem',
						alignItems: 'center',
					} }
				>
					<Button variant="primary" icon={ <ArrowUpIcon /> } />
					<Button variant="ghost" icon={ <ArrowUpIcon /> } />
					<Button variant="outline" icon={ <ArrowUpIcon /> } />
					<Button
						variant="ghost"
						icon={ <ArrowUpIcon /> }
						size="sm"
					/>
				</div>
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
