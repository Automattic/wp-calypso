import { useState } from 'react';
import SearchableDropdown from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof SearchableDropdown > = {
	title: 'packages/components/SearchableDropdown',
	component: SearchableDropdown,
};

export default meta;
type Story = StoryObj< typeof SearchableDropdown >;

export const Default: Story = {
	render: function Template( props ) {
		const [ value, onChange ] =
			useState< React.ComponentProps< typeof SearchableDropdown >[ 'value' ] >( 'home' );

		return <SearchableDropdown value={ value } onChange={ onChange } { ...props } />;
	},
	args: {
		options: [
			{
				label: 'Home',
				value: 'home',
			},
		],
	},
};
