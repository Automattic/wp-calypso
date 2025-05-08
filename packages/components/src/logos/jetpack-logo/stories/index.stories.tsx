import { JetpackLogo } from '../index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof JetpackLogo > = {
	title: 'packages/components/Logos/JetpackLogo',
	component: JetpackLogo,
};
export default meta;

type Story = StoryObj< typeof JetpackLogo >;

export const Color: Story = {
	args: { colorVariant: 'color' },
};

export const Black: Story = {
	args: { colorVariant: 'black' },
};

export const White: Story = {
	args: { colorVariant: 'white' },
	decorators: [
		( Story ) => (
			<div style={ { background: '#000', padding: '20px' } }>
				<Story />
			</div>
		),
	],
};

export const FullColor: Story = {
	args: { full: true, colorVariant: 'color' },
};

export const FullBlack: Story = {
	args: { full: true, colorVariant: 'black' },
};

export const FullWhite: Story = {
	args: { full: true, colorVariant: 'white' },
	decorators: [
		( Story ) => (
			<div style={ { background: '#000', padding: '20px' } }>
				<Story />
			</div>
		),
	],
};

export const Monochrome: Story = {
	args: { monochrome: true },
};
