import type { Meta, StoryObj } from '@storybook/react';
import { Canvas } from './canvas';
import { Button } from './button';
import { useState } from 'react';

const meta: Meta< typeof Canvas > = {
	title: 'Primitives/Canvas',
	component: Canvas,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		fit: {
			control: 'select',
			options: [ 'contain', 'cover', 'fill', 'none' ],
			description: 'How content should fit within the canvas',
		},
		background: {
			control: 'color',
			description: 'Background color or gradient',
		},
		children: {
			control: false,
			description: 'Content to display in the canvas',
		},
	},
} satisfies Meta< typeof Canvas >;

export default meta;
type Story = StoryObj< typeof meta >;

const SampleImage = () => (
	<img
		src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
		alt="Sample landscape"
		style={ { maxWidth: '100%', height: 'auto' } }
	/>
);

export const Contain: Story = {
	args: {
		fit: 'contain',
		background: '#f0f0f0',
		style: { height: '400px', borderRadius: '8px' },
		children: <SampleImage />,
	},
};

export const Cover: Story = {
	args: {
		fit: 'cover',
		background: '#f0f0f0',
		style: { height: '400px', borderRadius: '8px' },
		children: <SampleImage />,
	},
};

export const Fill: Story = {
	args: {
		fit: 'fill',
		background: '#f0f0f0',
		style: { height: '400px', borderRadius: '8px' },
		children: <SampleImage />,
	},
};

export const None: Story = {
	args: {
		fit: 'none',
		background: '#f0f0f0',
		style: { height: '400px', borderRadius: '8px' },
		children: <SampleImage />,
	},
};

export const WithGradient: Story = {
	args: {
		fit: 'contain',
		background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		style: { height: '400px', borderRadius: '8px' },
		children: (
			<div
				style={ {
					color: 'white',
					textAlign: 'center',
					padding: '40px',
				} }
			>
				<h2 style={ { fontSize: '24px', marginBottom: '12px' } }>
					Canvas with Gradient
				</h2>
				<p>Any content can be placed inside the canvas</p>
			</div>
		),
	},
};

const InteractiveCanvas = () => {
	const [ fit, setFit ] = useState< 'contain' | 'cover' | 'fill' | 'none' >(
		'contain'
	);

	return (
			<div>
				<div
					style={ {
						display: 'flex',
						gap: '12px',
						marginBottom: '20px',
					} }
				>
					<Button
						variant={ fit === 'contain' ? 'primary' : 'outline' }
						size="sm"
						onClick={ () => setFit( 'contain' ) }
					>
						Contain
					</Button>
					<Button
						variant={ fit === 'cover' ? 'primary' : 'outline' }
						size="sm"
						onClick={ () => setFit( 'cover' ) }
					>
						Cover
					</Button>
					<Button
						variant={ fit === 'fill' ? 'primary' : 'outline' }
						size="sm"
						onClick={ () => setFit( 'fill' ) }
					>
						Fill
					</Button>
					<Button
						variant={ fit === 'none' ? 'primary' : 'outline' }
						size="sm"
						onClick={ () => setFit( 'none' ) }
					>
						None
					</Button>
				</div>
				<Canvas
					fit={ fit }
					background="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
					style={ { height: '400px', borderRadius: '8px' } }
				>
					<SampleImage />
				</Canvas>
				<p
					style={ {
						marginTop: '12px',
						color: '#666',
						fontSize: '14px',
					} }
				>
				<strong>Current fit mode:</strong> { fit }
			</p>
		</div>
	);
};

export const Interactive: Story = {
	render: () => <InteractiveCanvas />,
};

export const AllFitModes: Story = {
	name: 'All Fit Modes Comparison',
	render: () => (
		<div
			style={ {
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				gap: '20px',
			} }
		>
			<div>
				<h3 style={ { marginBottom: '12px', fontSize: '16px' } }>
					Contain
				</h3>
				<Canvas
					fit="contain"
					background="#f0f0f0"
					style={ { height: '300px', borderRadius: '8px' } }
				>
					<SampleImage />
				</Canvas>
				<p
					style={ {
						marginTop: '8px',
						fontSize: '12px',
						color: '#666',
					} }
				>
					Maintains aspect ratio, fits entirely within canvas
				</p>
			</div>
			<div>
				<h3 style={ { marginBottom: '12px', fontSize: '16px' } }>
					Cover
				</h3>
				<Canvas
					fit="cover"
					background="#f0f0f0"
					style={ { height: '300px', borderRadius: '8px' } }
				>
					<SampleImage />
				</Canvas>
				<p
					style={ {
						marginTop: '8px',
						fontSize: '12px',
						color: '#666',
					} }
				>
					Maintains aspect ratio, fills entire canvas
				</p>
			</div>
			<div>
				<h3 style={ { marginBottom: '12px', fontSize: '16px' } }>
					Fill
				</h3>
				<Canvas
					fit="fill"
					background="#f0f0f0"
					style={ { height: '300px', borderRadius: '8px' } }
				>
					<SampleImage />
				</Canvas>
				<p
					style={ {
						marginTop: '8px',
						fontSize: '12px',
						color: '#666',
					} }
				>
					Stretches to fill canvas, may distort
				</p>
			</div>
			<div>
				<h3 style={ { marginBottom: '12px', fontSize: '16px' } }>
					None
				</h3>
				<Canvas
					fit="none"
					background="#f0f0f0"
					style={ { height: '300px', borderRadius: '8px' } }
				>
					<SampleImage />
				</Canvas>
				<p
					style={ {
						marginTop: '8px',
						fontSize: '12px',
						color: '#666',
					} }
				>
					Original size, centered in canvas
				</p>
			</div>
		</div>
	),
};
