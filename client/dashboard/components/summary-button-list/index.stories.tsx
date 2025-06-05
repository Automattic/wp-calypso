import { SummaryButton } from '@automattic/components';
import { Meta, StoryObj } from '@storybook/react';
import { Icon } from '@wordpress/components';
import { brush, home, seen } from '@wordpress/icons';
import { SummaryButtonList } from './';

const meta: Meta< typeof SummaryButtonList > = {
	title: 'client/dashboard/SummaryButtonList',
	component: SummaryButtonList,
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
type Story = StoryObj< typeof SummaryButtonList >;

export const Default: Story = {
	args: {
		title: 'General Settings',
		children: [
			<SummaryButton
				key="visibility"
				title="Site visibility"
				decoration={ <Icon icon={ seen } /> }
				badges={ [ { text: 'Public', intent: 'success' } ] }
			/>,
			<SummaryButton
				key="theme"
				title="Theme"
				decoration={ <Icon icon={ brush } /> }
				badges={ [ { text: 'Twenty Twenty-Four' } ] }
			/>,
			<SummaryButton
				key="home"
				title="Homepage settings"
				decoration={ <Icon icon={ home } /> }
				badges={ [ { text: 'Latest posts' } ] }
			/>,
		],
	},
};

export const WithDescription: Story = {
	args: {
		...Default.args,
		description: 'Configure the basic settings for your site',
	},
};

export const LowDensity: Story = {
	args: {
		...Default.args,
		density: 'low',
	},
};

export const WithDescriptionsInButtons: Story = {
	args: {
		title: 'General Settings',
		density: 'low',
		children: [
			<SummaryButton
				key="visibility"
				title="Site visibility"
				description="Control who can see your site"
				decoration={ <Icon icon={ seen } /> }
				badges={ [ { text: 'Public', intent: 'success' } ] }
			/>,
			<SummaryButton
				key="theme"
				title="Theme"
				description="Change the look and feel of your site"
				decoration={ <Icon icon={ brush } /> }
				badges={ [ { text: 'Twenty Twenty-Four' } ] }
			/>,
			<SummaryButton
				key="home"
				title="Homepage settings"
				description="Choose what appears on your homepage"
				decoration={ <Icon icon={ home } /> }
				badges={ [ { text: 'Latest posts' } ] }
			/>,
		],
	},
};
