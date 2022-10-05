import { LaunchpadFlowTaskList, Task } from './types';

export const tasks: Task[] = [
	{
		id: 'setup_newsletter',
		isCompleted: true,
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'plan_selected',
		isCompleted: true,
		taskType: 'blog',
		displayBadge: true,
	},
	{
		id: 'subscribers_added',
		isCompleted: true,
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'first_post_published',
		isCompleted: false,
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'design_selected',
		isCompleted: true,
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'setup_link_in_bio',
		isCompleted: true,
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'links_added',
		isCompleted: false,
		taskType: 'blog',
		displayBadge: false,
	},
	{
		id: 'link_in_bio_launched',
		isCompleted: false,
		taskType: 'blog',
		displayBadge: false,
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
