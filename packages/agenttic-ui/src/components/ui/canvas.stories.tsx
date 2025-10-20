import type { Meta, StoryObj } from '@storybook/react';
import { Canvas } from './canvas';
import { Button } from './button';
import { useState } from 'react';
import { Spinner } from '@wordpress/components';

const meta: Meta< typeof Canvas > = {
	title: 'Primitives/Canvas',
	component: Canvas,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
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

export const Default: Story = {
	name: 'Default',
	render: () => (
		<div
			style={ {
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				gap: '20px',
			} }
		>
			<div style={ { width: '1000px', height: '1000px' } }>
				<Canvas isProcessing={ false }>
					<SampleImage />
				</Canvas>
				<Canvas isProcessing={ true }>
					<SampleImage />
				</Canvas>
				<Canvas isProcessing={ true } loader={ <Spinner /> }>
					<SampleImage />
				</Canvas>
			</div>
		</div>
	),
};
