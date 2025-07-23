import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import React from 'react';

const meta = {
	title: 'Primitives/Textarea',
	component: Textarea,
	parameters: {
		layout: 'padded',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		placeholder: {
			control: 'text',
		},
		value: {
			control: 'text',
		},
		disabled: {
			control: 'boolean',
		},
		rows: {
			control: 'number',
		},
		maxLength: {
			control: 'number',
		},
		onChange: { action: 'changed' },
		onFocus: { action: 'focused' },
		onBlur: { action: 'blurred' },
	},
} satisfies Meta< typeof Textarea >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	render: ( args ) => (
		<Textarea { ...args } style={ { border: '1px solid #ccc' } } />
	),
	args: {
		placeholder: 'Type your message here...',
	},
};

export const WithValue: Story = {
	render: ( args ) => (
		<Textarea { ...args } style={ { border: '1px solid #ccc' } } />
	),
	args: {
		value: 'This is some pre-filled content in the textarea.',
		placeholder: 'Type your message here...',
	},
};

export const Disabled: Story = {
	render: ( args ) => (
		<Textarea { ...args } style={ { border: '1px solid #ccc' } } />
	),
	args: {
		value: 'This textarea is disabled',
		disabled: true,
	},
};

export const WithMaxLength: Story = {
	render: ( args ) => (
		<Textarea { ...args } style={ { border: '1px solid #ccc' } } />
	),
	args: {
		placeholder: 'Maximum 100 characters',
		maxLength: 100,
	},
};

export const MultipleTextareas: Story = {
	render: () => (
		<div
			style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }
		>
			<div>
				<div
					style={ {
						marginBottom: '0.25rem',
						fontWeight: 'bold',
					} }
				>
					Title
				</div>
				<Textarea
					placeholder="Enter a title..."
					rows={ 1 }
					style={ { border: '1px solid #ccc' } }
				/>
			</div>
			<div>
				<div
					style={ {
						marginBottom: '0.25rem',
						fontWeight: 'bold',
					} }
				>
					Description
				</div>
				<Textarea
					placeholder="Enter a description..."
					rows={ 3 }
					style={ { border: '1px solid #ccc' } }
				/>
			</div>
			<div>
				<div
					style={ {
						marginBottom: '0.25rem',
						fontWeight: 'bold',
					} }
				>
					Notes
				</div>
				<Textarea
					placeholder="Additional notes..."
					rows={ 5 }
					style={ { border: '1px solid #ccc' } }
				/>
			</div>
		</div>
	),
};
