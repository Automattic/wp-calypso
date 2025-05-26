import { JetpackLogo } from '..';
import { StorybookLogoTable } from '../../utils/storybook-logo-table';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof JetpackLogo.Default > = {
	title: 'Unaudited/Logos/JetpackLogo',
	component: JetpackLogo.Default,
	argTypes: {
		'aria-hidden': {
			control: 'boolean',
		},
	},
};
export default meta;

type Story = StoryObj< typeof JetpackLogo.Default >;

export const Default: Story = {
	render: ( args ) => (
		<StorybookLogoTable logos={ [ JetpackLogo.Default, JetpackLogo.Mark ] } props={ args } />
	),
};
