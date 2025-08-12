import { Meta, StoryObj } from '@storybook/react';
import {
	RouterProvider,
	createMemoryHistory,
	createRouter,
	createRootRoute,
} from '@tanstack/react-router';
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
import './style.stories.scss';
import OverviewCard from './';

const meta = {
	title: 'client/dashboard/OverviewCard',
	component: OverviewCard,
	parameters: {
		layout: 'centered',
	},
	tags: [ 'autodocs' ],
	decorators: [
		( Story ) => (
			<RouterProvider
				router={ createRouter( {
					basepath: '/',
					routeTree: createRootRoute( { component: Story } ),
					history: createMemoryHistory(),
				} ) }
			/>
		),
	],
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
		link: '/',
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

export const WithExtraBottomContent: Story = {
	args: {
		title: 'Plan',
		heading: 'Personal',
		description: 'Upgrade to unlock more features',
		icon: wordpress,
		link: '/',
		bottom: (
			<>
				<div>Extra content</div>
				<div style={ { maxWidth: 500 } }>
					This is some extra content that appears at the bottom of the card. It should not be
					included as part of the clickable area of the card.
				</div>
			</>
		),
	},
};
