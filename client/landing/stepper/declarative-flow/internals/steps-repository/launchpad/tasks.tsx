import { START_WRITING_FLOW } from '@automattic/onboarding';
import { LaunchpadFlowTaskList, Task } from './types';

export const DOMAIN_UPSELL = 'domain_upsell';

export const tasks: Task[] = [
	{
		id: 'plan_selected',
		completed: true,
		disabled: false,
	},
	{
		id: 'first_post_published',
		completed: false,
		disabled: false,
	},
	{
		id: 'setup_blog',
		completed: false,
		disabled: false,
	},
	{
		id: 'blog_launched',
		completed: false,
		disabled: false,
	},
	{
		id: DOMAIN_UPSELL,
		completed: false,
		disabled: false,
	},
];

export const launchpadFlowTasks: LaunchpadFlowTaskList = {
	[ START_WRITING_FLOW ]: [
		'first_post_published',
		'setup_blog',
		DOMAIN_UPSELL,
		'plan_selected',
		'blog_launched',
	],
};
