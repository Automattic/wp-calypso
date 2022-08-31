import { LaunchpadFlowTaskList, Task } from './types';

export const tasks: Task[] = [
	{
		id: 'setup_newsletter',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'plan_selected',
		isCompleted: true,
		taskType: 'blog',
		actionUrl: '#',
		displayBadge: true,
	},
	{
		id: 'subscribers_added',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'first_post_published',
		isCompleted: false,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'design_selected',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'setup_link_in_bio',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'links_added',
		isCompleted: false,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'link_in_bio_launched',
		isCompleted: false,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
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
