import { JetpackLogo } from '../index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof JetpackLogo > = {
	title: 'Unaudited/Logos/JetpackLogo',
	component: JetpackLogo,
	decorators: [
		( Story, { args } ) => (
			<div
				style={ {
					backgroundColor: args.theme === 'dark' ? '#000' : '#fff',
					color: args.theme === 'dark' ? '#fff' : '#000',
					minHeight: '100px',
					padding: '1rem',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				} }
			>
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj< typeof JetpackLogo >;

export const Default: Story = {};

export const Full: Story = {
	args: {
		full: true,
	},
};

/**
 * The monochrome version uses the same color as the inherited text color,
 * and uses a mask for the triangles in the logo (instead of a fill).
 */
export const Monochrome: Story = {
	args: {
		monochrome: true,
	},
};
