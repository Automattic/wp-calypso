import { START_WRITING_FLOW } from '@automattic/onboarding';
import { LaunchpadFlowTaskList, Task } from './types';

export const DOMAIN_UPSELL = 'domain_upsell';

/**
 * Task definitions will soon be fetched through a WordPress REST API, making this file
 * redundant. We're doing this because it will allow us to access checklist and task
 * information outside of the Calypso client.
 *
 * Please DO NOT add any new tasks or checklists to this file. Instead, add it to the
 * jetpack mu wpcom plugin.
 */

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
