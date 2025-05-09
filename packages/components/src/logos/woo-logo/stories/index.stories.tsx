import { WooLogo } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof WooLogo > = {
	title: 'Unaudited/Logos/WooLogo',
	component: WooLogo,
};
export default meta;

type Story = StoryObj< typeof WooLogo >;

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
