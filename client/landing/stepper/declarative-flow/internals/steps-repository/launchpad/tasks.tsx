import { LaunchpadFlowTaskList, Task } from './types';

export const tasks: Task[] = [
	{
		id: 'setup_newsletter',
		completed: true,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'plan_selected',
		completed: true,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'subscribers_added',
		completed: true,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'first_post_published',
		completed: false,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'design_selected',
		completed: true,
		disabled: true,
		taskType: 'blog',
	},
	{
		id: 'setup_link_in_bio',
		completed: true,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'links_added',
		completed: false,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'link_in_bio_launched',
		completed: false,
		disabled: true,
		taskType: 'blog',
	},
	{
		id: 'videopress_setup',
		isCompleted: true,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'videopress_upload',
		isCompleted: false,
		actionUrl: '#',
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'videopress_launched',
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
	videopress: [ 'videopress_setup', 'plan_selected', 'videopress_upload', 'videopress_launched' ],
};
