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
		pressed: {
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

// Primary Variant Stories
export const Primary: Story = {
	args: {
		variant: 'primary',
		children: 'Primary Button',
	},
};

export const PrimaryPressed: Story = {
	args: {
		variant: 'primary',
		pressed: true,
		children: 'Primary Pressed',
	},
};

export const PrimaryDisabled: Story = {
	args: {
		variant: 'primary',
		disabled: true,
		children: 'Primary Disabled',
	},
};

export const PrimaryWithIcon: Story = {
	args: {
		variant: 'primary',
		icon: <ArrowUpIcon />,
		children: 'Primary with Icon',
	},
};

export const PrimaryIconOnly: Story = {
	args: {
		variant: 'primary',
		icon: <ArrowUpIcon />,
	},
};

// Ghost Variant Stories
export const Ghost: Story = {
	args: {
		variant: 'ghost',
		children: 'Ghost Button',
	},
};

export const GhostPressed: Story = {
	args: {
		variant: 'ghost',
		pressed: true,
		children: 'Ghost Pressed',
	},
};

export const GhostDisabled: Story = {
	args: {
		variant: 'ghost',
		disabled: true,
		children: 'Ghost Disabled',
	},
};

export const GhostWithIcon: Story = {
	args: {
		variant: 'ghost',
		icon: <ArrowUpIcon />,
		children: 'Ghost with Icon',
	},
};

export const GhostIconOnly: Story = {
	args: {
		variant: 'ghost',
		icon: <ArrowUpIcon />,
	},
};

// Outline Variant Stories
export const Outline: Story = {
	args: {
		variant: 'outline',
		children: 'Outline Button',
	},
};

export const OutlinePressed: Story = {
	args: {
		variant: 'outline',
		pressed: true,
		children: 'Outline Pressed',
	},
};

export const OutlineDisabled: Story = {
	args: {
		variant: 'outline',
		disabled: true,
		children: 'Outline Disabled',
	},
};

export const OutlineWithIcon: Story = {
	args: {
		variant: 'outline',
		icon: <ArrowUpIcon />,
		children: 'Outline with Icon',
	},
};

export const OutlineIconOnly: Story = {
	args: {
		variant: 'outline',
		icon: <ArrowUpIcon />,
	},
};

// Link Variant Stories
export const Link: Story = {
	args: {
		variant: 'link',
		children: 'Link Button',
	},
};

export const LinkPressed: Story = {
	args: {
		variant: 'link',
		pressed: true,
		children: 'Link Pressed',
	},
};

export const LinkDisabled: Story = {
	args: {
		variant: 'link',
		disabled: true,
		children: 'Link Disabled',
	},
};

export const AllVariantsMatrix: Story = {
	name: 'All Variants & States',
	render: () => (
		<div
			style={ { display: 'flex', flexDirection: 'column', gap: '2rem' } }
		>
			{ /* Primary Row */ }
			<div>
				<h4
					style={ {
						margin: '0 0 1rem',
						fontSize: '14px',
						fontWeight: '600',
					} }
				>
					Primary
				</h4>
				<div
					style={ {
						display: 'flex',
						gap: '0.5rem',
						alignItems: 'center',
					} }
				>
					<Button variant="primary">Default</Button>
					<Button variant="primary" pressed>
						Pressed
					</Button>
					<Button variant="primary" disabled>
						Disabled
					</Button>
					<Button variant="primary" icon={ <ArrowUpIcon /> }>
						With Icon
					</Button>
					<Button variant="primary" icon={ <ArrowUpIcon /> } />
				</div>
			</div>

			{ /* Ghost Row */ }
			<div>
				<h4
					style={ {
						margin: '0 0 1rem',
						fontSize: '14px',
						fontWeight: '600',
					} }
				>
					Ghost
				</h4>
				<div
					style={ {
						display: 'flex',
						gap: '0.5rem',
						alignItems: 'center',
					} }
				>
					<Button variant="ghost">Default</Button>
					<Button variant="ghost" pressed>
						Pressed
					</Button>
					<Button variant="ghost" disabled>
						Disabled
					</Button>
					<Button variant="ghost" icon={ <ArrowUpIcon /> }>
						With Icon
					</Button>
					<Button variant="ghost" icon={ <ArrowUpIcon /> } />
				</div>
			</div>

			{ /* Outline Row */ }
			<div>
				<h4
					style={ {
						margin: '0 0 1rem',
						fontSize: '14px',
						fontWeight: '600',
					} }
				>
					Outline
				</h4>
				<div
					style={ {
						display: 'flex',
						gap: '0.5rem',
						alignItems: 'center',
					} }
				>
					<Button variant="outline">Default</Button>
					<Button variant="outline" pressed>
						Pressed
					</Button>
					<Button variant="outline" disabled>
						Disabled
					</Button>
					<Button variant="outline" icon={ <ArrowUpIcon /> }>
						With Icon
					</Button>
					<Button variant="outline" icon={ <ArrowUpIcon /> } />
				</div>
			</div>

			{ /* Link Row */ }
			<div>
				<h4
					style={ {
						margin: '0 0 1rem',
						fontSize: '14px',
						fontWeight: '600',
					} }
				>
					Link
				</h4>
				<div
					style={ {
						display: 'flex',
						gap: '0.5rem',
						alignItems: 'center',
					} }
				>
					<Button variant="link">Default</Button>
					<Button variant="link" pressed>
						Pressed
					</Button>
					<Button variant="link" disabled>
						Disabled
					</Button>
				</div>
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
