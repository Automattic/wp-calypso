import { useState } from 'react';
import PageDots from './';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof PageDots > = {
	title: 'client/dashboard/PageDots',
	component: PageDots,
	tags: [ 'autodocs' ],
};

export default meta;
type Story = StoryObj< typeof PageDots >;

export const Default: Story = {
	render: function Render( args ) {
		const [ current, setCurrent ] = useState( 2 );
		return <PageDots { ...args } current={ current } onChange={ setCurrent } />;
	},
	args: {
		count: 11,
		label: 'Tour sections',
	},
};
