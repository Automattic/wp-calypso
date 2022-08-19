import { LaunchpadFlowTaskList } from './types';

export const tasks = [
	{
		id: 'setup_newsletter',
		isCompleted: true,
		actionUrl: '#',
		title: 'Set up Newsletter',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'plan_selected',
		isCompleted: true,
		taskType: 'blog',
		actionUrl: '#',
		title: 'Free Plan',
		displayBadge: true,
		badgeText: 'Personal',
	},
	{
		id: 'subscribers_added',
		isCompleted: true,
		actionUrl: '#',
		title: 'Add Subscribers',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'first_post_published',
		isCompleted: false,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'design_selected',
		isCompleted: true,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'setup_link_in_bio',
		isCompleted: true,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'links_added',
		isCompleted: false,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'link_in_bio_launched',
		isCompleted: false,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
];

export const launchpadFlowTasks: LaunchpadFlowTaskList = {
	newsletter: [ 'setup_newsletter', 'plan_selected', 'subscribers_added', 'first_post_published' ],
	linkInBio: [
		'design_selected',
		'setup_link_in_bio',
		'plan_selected',
		'links_added',
		'link_in_bio_launched',
	],
};
