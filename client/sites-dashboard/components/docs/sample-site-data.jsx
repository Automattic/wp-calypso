const exampleSite = {
	URL: 'https://wpvip.com',
	is_coming_soon: false,
	is_private: false,
	visible: true,
	launch_status: 'launched',
	name: 'The long title of the sample site',
	jetpack: false,
	site_owner: 12,
	lang: 'en',
	options: {
		admin_url: 'https://wpvip.com/wp-admin/',
		is_redirect: false,
		is_wpforteams_site: false,
		launchpad_screen: false,
		site_intent: '',
		unmapped_url: 'https://wpvip.com',
		updated_at: new Date(),
	},
	p2_thumbnail_elements: null,
	plan: {
		product_id: 1,
		product_slug: 'free_plan',
		product_name_short: 'Free',
		expired: false,
		user_is_owner: false,
		is_free: true,
	},
	is_wpcom_atomic: false,
	title: 'The long title of the sample site',
	slug: 'wpvip.wordpress.com',
};

const siteSimpleFree = {
	...exampleSite,
	ID: 1,
	title: 'Free Simple Site',
};

const siteSimpleBusinessComingSoon = {
	...exampleSite,
	ID: 2,
	options: {
		...exampleSite.options,
		updated_at: new Date( +new Date() - 60 * 60 * 24 * 1000 ),
	},
	plan: {
		...exampleSite.plan,
		product_id: 1008,
		product_slug: 'business-bundle',
		product_name_short: 'Creator',
		user_is_owner: true,
		is_free: false,
	},
	is_coming_soon: true,
	launch_status: 'unlaunched',
	title: 'Creator Simple Site with Coming Soon status',
};

const siteSimpleBusinessExpired = {
	...exampleSite,
	ID: 3,
	options: {
		...exampleSite.options,
		updated_at: new Date( +new Date() - 60 * 60 * 24 * 1000 ),
	},
	plan: {
		...exampleSite.plan,
		product_id: 1008,
		product_slug: 'business-bundle',
		product_name_short: 'Creator',
		user_is_owner: true,
		is_free: false,
		expired: true,
	},
	title: 'Expired Creator Simple Site',
};

const siteJetpackComplete = {
	...exampleSite,
	ID: 4,
	jetpack: true,
	options: {
		...exampleSite.options,
		updated_at: new Date( +new Date() - 60 * 60 * 24 * 2 * 1000 ),
	},
	plan: {
		...exampleSite.plan,
		product_id: 2014,
		product_slug: 'jetpack_complete',
		product_name_short: 'Complete',
		user_is_owner: true,
		is_free: false,
	},
	title: 'Jetpack Complete Site',
};

const siteSimplePrivateP2 = {
	...exampleSite,
	ID: 5,
	is_private: true,
	visible: false,
	options: {
		...exampleSite.options,
		is_wpforteams_site: true,
		updated_at: new Date( +new Date() - 60 * 60 * 24 * 30 * 1000 ),
	},
	plan: {
		...exampleSite.plan,
		product_id: 1040,
		product_slug: '"wp_p2_plus_monthly"',
		product_name_short: 'P2+',
		is_free: false,
	},
	icon: {
		ico: 'https://wpjobmanager.com/wp-content/uploads/2022/10/wp-job-manager-logo.webp?w=16',
		img: 'https://wpjobmanager.com/wp-content/uploads/2022/10/wp-job-manager-logo.webp',
	},
	p2_thumbnail_elements: {
		color_link: '#0267ff',
		color_sidebar_background: '#d0ccb8',
		header_image: 'https://wpjobmanager.com/wp-content/uploads/2022/11/hero-resized.png?resize=680',
	},
	title: 'Simple Private P2 Site',
};

export default [
	siteSimpleFree,
	siteSimpleBusinessComingSoon,
	siteSimpleBusinessExpired,
	siteJetpackComplete,
	siteSimplePrivateP2,
];
