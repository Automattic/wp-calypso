export default {
	site_intent: 'free',
	launchpad_screen: 'full',
	checklist_statuses: {
		setup_free: true,
		setup_general: true,
		design_completed: true,
		site_theme_selected: true,
	},
	checklist: [
		{
			id: 'design_selected',
			title: 'Select a design',
			completed: true,
			disabled: false,
			subtitle: '',
			badge_text: '',
			isLaunchTask: false,
			calypso_path: '/setup/update-design/designSetup?siteSlug=site62798.wordpress.com',
		},
		{
			id: 'setup_link_in_bio',
			title: 'Personalize Link in Bio',
			completed: true,
			disabled: false,
			subtitle: '',
			badge_text: '',
			isLaunchTask: false,
			calypso_path:
				'/setup/link-in-bio-post-setup/linkInBioPostSetup?siteSlug=site62798.wordpress.com',
		},
		{
			id: 'plan_selected',
			title: 'Choose a plan',
			completed: true,
			disabled: false,
			subtitle: '',
			badge_text: '',
			isLaunchTask: false,
			calypso_path: '/plans/site62798.wordpress.com',
		},
		{
			id: 'links_added',
			title: 'Add links',
			completed: false,
			disabled: false,
			subtitle: '',
			badge_text: '',
			isLaunchTask: false,
			calypso_path: '/site-editor/site62798.wordpress.com',
		},
		{
			id: 'link_in_bio_launched',
			title: 'Launch your site',
			completed: false,
			disabled: true,
			subtitle: '',
			badge_text: '',
			isLaunchTask: false,
		},
	],
	is_enabled: true,
	is_dismissed: false,
	is_dismissible: false,
	title: 'Next steps for your site',
};
