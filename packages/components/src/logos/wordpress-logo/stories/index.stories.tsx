import { WordPressLogo } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof WordPressLogo > = {
	title: 'Unaudited/Logos/WordPressLogo',
	component: WordPressLogo,
	decorators: [
		( Story ) => (
			// TODO: Default styles for this component are too opinionated,
			// rendering as a white logo with outer margin. Should fix.
			<div style={ { background: '#2c3338', padding: '10px' } }>
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj< typeof WordPressLogo >;

export const Default: Story = {};
