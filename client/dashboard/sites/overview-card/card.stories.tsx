import { Meta, StoryObj } from '@storybook/react';
import { people, seen, wordpress, backup, starEmpty, comment, envelope } from '@wordpress/icons';
import OverviewCard, { OverviewCardProgressBar } from './';

const meta = {
	title: 'client/dashboard/OverviewCard',
	component: OverviewCard,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ],
	argTypes: {
		icon: {
			control: 'select',
			options: [ 'people', 'seen', 'wordpress', 'backup', 'starEmpty', 'comment', 'envelope' ],
			mapping: {
				people,
				seen,
				wordpress,
				backup,
				starEmpty,
				comment,
				envelope,
			},
		},
	},
} satisfies Meta< typeof OverviewCard >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Default: Story = {
	args: {
		title: 'Visitors',
		heading: '1,245',
		metaText: 'Past 7 days',
		icon: people,
	},
};

export const WithProgressBar: Story = {
	args: {
		title: 'Storage',
		heading: '236 MB',
		metaText: 'of 53 GB used',
		icon: backup,
		children: <OverviewCardProgressBar value={ 25 } />,
	},
};

export const WithLink: Story = {
	args: {
		title: 'Comments',
		heading: '24',
		metaText: 'Past 7 days',
		icon: comment,
		isLink: true,
	},
};
