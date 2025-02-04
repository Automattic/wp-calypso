import { WordPressLogo } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof WordPressLogo > = {
	title: 'packages/components/Logos/WordPressLogo',
	component: WordPressLogo,
	decorators: [
		( Story ) => (
			// TODO: Default styles for this component are too opinionated,
			// rendering as a white logo with outer margin. Should fix.
			<div
				style={ {
					background:
						'linear-gradient(45deg, #909090 25%, transparent 25%), linear-gradient(-45deg, #909090 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #909090 75%), linear-gradient(-45deg, transparent 75%, #909090 75%)',
					backgroundSize: '20px 20px',
					backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
					backgroundColor: '#fff',
				} }
			>
				<Story />
			</div>
		),
	],
	parameters: {
		controls: { expanded: true },
	},
};
export default meta;

type Story = StoryObj< typeof WordPressLogo >;

export const Default: Story = {};
