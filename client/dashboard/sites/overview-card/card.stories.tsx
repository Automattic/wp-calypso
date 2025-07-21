import { Meta, StoryObj } from '@storybook/react';
import {
	people,
	seen,
	wordpress,
	backup,
	download,
	starEmpty,
	comment,
	envelope,
} from '@wordpress/icons';
import OverviewCard from './';

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
			options: [
				'people',
				'seen',
				'wordpress',
				'backup',
				'download',
				'starEmpty',
				'comment',
				'envelope',
			],
			mapping: {
				people,
				seen,
				wordpress,
				backup,
				download,
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
		description: 'Past 7 days',
		icon: people,
	},
};

export const WithProgress: Story = {
	args: {
		title: 'Migrate',
		heading: 'Migrating site',
		description: 'We’ll email you when it’s done',
		icon: download,
		progress: {
			value: 76,
			max: 100,
			label: '76%',
		},
	},
};

export const WithLink: Story = {
	args: {
		title: 'Comments',
		heading: '24',
		description: 'Past 7 days',
		icon: comment,
		externalLink: 'https://wordpress.com',
	},
};
