export const tasks = [
	{
		id: 'setup_newsletter',
		isCompleted: true,
		actionUrl: '#',
		title: 'Set up Newsletter',
		taskType: 'blog',
	},
	{
		id: 'plan_selected',
		isCompleted: true,
		taskType: 'blog',
		actionUrl: '#',
		title: 'Free Plan',
	},
	{
		id: 'subscribers_added',
		isCompleted: false,
		actionUrl: '#',
		title: 'Add Subscribers',
		taskType: 'blog',
	},
	{
		id: 'first_post_published',
		isCompleted: false,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
	},
	{
		id: 'design_selected',
		isCompleted: true,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
	},
	{
		id: 'setup_link_in_bio',
		isCompleted: true,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
	},
	{
		id: 'links_added',
		isCompleted: false,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
	},
	{
		id: 'link_in_bio_launched',
		isCompleted: false,
		actionUrl: '#',
		title: 'Write your first post',
		taskType: 'blog',
	},
];

export const launchpad_flow_tasks: any = {
	newsletter: [ 'setup_newsletter', 'plan_selected', 'subscribers_added', 'first_post_published' ],
	linkInBio: [
		'design_selected',
		'setup_link_in_bio',
		'plan_selected',
		'links_added',
		'link_in_bio_launched',
	],
};
