import { Meta, StoryObj } from '@storybook/react';
import { __experimentalText as Text } from '@wordpress/components';
import { SectionHeader } from '../section-header';
import { CollapsibleCard } from './index';

const meta: Meta< typeof CollapsibleCard > = {
	title: 'client/dashboard/CollapsibleCard',
	component: CollapsibleCard,
	tags: [ 'autodocs' ],
	parameters: {
		actions: { argTypesRegex: '^on.*' },
	},
	decorators: [
		( Story ) => (
			<div style={ { maxWidth: '600px', margin: '0 auto' } }>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj< typeof CollapsibleCard >;

export const Default: Story = {
	args: {
		header: <SectionHeader level={ 3 } title="Site settings" />,
		toggleLabel: 'Toggle card content visibility',
		children: (
			<Text>
				Here are your site settings. You can toggle this section to keep it out of the way when not
				needed.
			</Text>
		),
	},
};
