import { LINK_IN_BIO_FLOW, LINK_IN_BIO_TLD_FLOW } from '@automattic/onboarding';
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
		completed: true,
		taskType: 'blog',
		disabled: false,
	},
	{
		id: 'videopress_upload',
		completed: false,
		taskType: 'blog',
		disabled: false,
	},
	{
		id: 'videopress_launched',
		completed: false,
		taskType: 'blog',
		disabled: true,
	},
	{
		id: 'setup_free',
		completed: true,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'setup_general',
		completed: true,
		disabled: true,
		taskType: 'blog',
	},
	{
		id: 'design_edited',
		completed: false,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'site_launched',
		completed: false,
		disabled: false,
		taskType: 'blog',
	},
];

const linkInBioTaskList = [
	'design_selected',
	'setup_link_in_bio',
	'plan_selected',
	'links_added',
	'link_in_bio_launched',
];

export const launchpadFlowTasks: LaunchpadFlowTaskList = {
	newsletter: [ 'setup_newsletter', 'plan_selected', 'subscribers_added', 'first_post_published' ],
	[ LINK_IN_BIO_FLOW ]: linkInBioTaskList,
	[ LINK_IN_BIO_TLD_FLOW ]: linkInBioTaskList,
	free: [
		'setup_free',
		'design_selected',
		'first_post_published',
		'design_edited',
		'site_launched',
	],
	build: [
		'setup_general',
		'design_selected',
		'first_post_published',
		'design_edited',
		'site_launched',
	],
	videopress: [ 'videopress_setup', 'plan_selected', 'videopress_upload', 'videopress_launched' ],
};
