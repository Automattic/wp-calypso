import { BigSkyLogo } from '..';
import { StorybookLogoTable } from '../../utils/storybook-logo-table';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof BigSkyLogo.Mark > = {
	title: 'Unaudited/Logos/BigSkyLogo',
	component: BigSkyLogo.Mark,
	argTypes: {
		'aria-hidden': {
			control: 'boolean',
		},
	},
};
export default meta;

type Story = StoryObj< typeof BigSkyLogo.Mark >;

export const Default: Story = {
	render: ( args ) => <StorybookLogoTable logos={ [ BigSkyLogo.Mark ] } props={ args } />,
};
