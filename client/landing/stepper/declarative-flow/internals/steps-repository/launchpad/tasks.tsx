import { LINK_IN_BIO_FLOW, LINK_IN_BIO_TLD_FLOW } from '@automattic/onboarding';
import { LaunchpadFlowTaskList, Task } from './types';

export const DOMAIN_UPSELL = 'domain_upsell';

export const tasks: Task[] = [
	{
		id: 'setup_newsletter',
		completed: true,
		disabled: false,
	},
	{
		id: 'plan_selected',
		completed: true,
		disabled: false,
	},
	{
		id: 'subscribers_added',
		completed: true,
		disabled: false,
	},
	{
		id: 'first_post_published',
		completed: false,
		disabled: false,
	},
	{
		id: 'design_selected',
		completed: true,
		disabled: true,
	},
	{
		id: 'setup_link_in_bio',
		completed: true,
		disabled: false,
	},
	{
		id: 'links_added',
		completed: false,
		disabled: false,
	},
	{
		id: 'link_in_bio_launched',
		completed: false,
		disabled: true,
	},
	{
		id: 'videopress_setup',
		completed: true,
		disabled: false,
	},
	{
		id: 'videopress_upload',
		completed: false,
		disabled: false,
	},
	{
		id: 'videopress_launched',
		completed: false,
		disabled: true,
	},
	{
		id: 'setup_free',
		completed: true,
		disabled: false,
	},
	{
		id: 'setup_general',
		completed: true,
		disabled: true,
	},
	{
		id: 'design_edited',
		completed: false,
		disabled: false,
	},
	{
		id: 'site_launched',
		completed: false,
		disabled: false,
	},
	{
		id: 'setup_write',
		completed: true,
		disabled: true,
	},
	{
		id: DOMAIN_UPSELL,
		completed: false,
		disabled: false,
	},
	{
		id: 'verify_email',
		completed: false,
		disabled: true,
	},
	{
		id: 'stripe_account_connected',
		completed: false,
		disabled: false,
		taskType: 'blog',
	},
	{
		id: 'newsletter_plan_created',
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
	newsletter: [
		'setup_newsletter',
		'plan_selected',
		'subscribers_added',
		'verify_email',
		'stripe_account_connected',
		'newsletter_plan_created',
		'first_post_published',
	],
	[ LINK_IN_BIO_FLOW ]: linkInBioTaskList,
	[ LINK_IN_BIO_TLD_FLOW ]: linkInBioTaskList,
	free: [
		'setup_free',
		'design_selected',
		DOMAIN_UPSELL,
		'first_post_published',
		'design_edited',
		'site_launched',
	],
	build: [
		'setup_general',
		'design_selected',
		DOMAIN_UPSELL,
		'first_post_published',
		'design_edited',
		'site_launched',
	],
	write: [
		'setup_write',
		'design_selected',
		DOMAIN_UPSELL,
		'first_post_published',
		'site_launched',
	],
	videopress: [ 'videopress_setup', 'plan_selected', 'videopress_upload', 'videopress_launched' ],
};
