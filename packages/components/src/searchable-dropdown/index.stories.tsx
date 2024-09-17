import { useState } from 'react';
import SearchableDropdown from './index';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof SearchableDropdown > = {
	title: 'packages/components/SearchableDropdown',
	component: ( props ) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		const [ value, onChange ] = useState( 'home' );

		return <SearchableDropdown value={ value } onChange={ ( e ) => onChange( e! ) } { ...props } />;
	},
};

export default meta;
type Story = StoryObj< typeof SearchableDropdown >;

export const Default: Story = {
	args: {
		options: [
			{
				label: 'Home',
				value: 'home',
			},
		],
	},
};
