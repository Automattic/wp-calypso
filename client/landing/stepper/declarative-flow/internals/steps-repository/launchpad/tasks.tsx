import { LaunchpadFlowTaskList, Task } from './types';

export const tasks: Task[] = [
	{
		id: 'setup_newsletter',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'plan_selected',
		isCompleted: true,
		taskType: 'blog',
		actionUrl: '#',
		displayBadge: true,
		badgeText: 'Personal',
	},
	{
		id: 'subscribers_added',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'first_post_published',
		isCompleted: false,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'design_selected',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'setup_link_in_bio',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'links_added',
		isCompleted: false,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
	{
		id: 'link_in_bio_launched',
		isCompleted: false,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
		badgeText: '',
	},
];

export const launchpadFlowTasks: LaunchpadFlowTaskList = {
	newsletter: [ 'setup_newsletter', 'plan_selected', 'subscribers_added', 'first_post_published' ],
	'link-in-bio': [
		'design_selected',
		'setup_link_in_bio',
		'plan_selected',
		'links_added',
		'link_in_bio_launched',
	],
};
