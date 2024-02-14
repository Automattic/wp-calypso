const REPOSITORY_TEMPLATES = {
	theme: [
		{
			name: 'Underscores',
			value: 'underscores',
			link: 'https://underscores.me/',
		},
		{
			name: 'Timber',
			value: 'timber',
			link: 'https://timber.github.io/docs/',
		},
		{
			name: 'Sage',
			value: 'sage',
			link: 'https://roots.io/sage/docs/',
		},
		{
			name: 'Understrap',
			value: 'understrap',
			link: 'https://understrap.com/',
		},
	],
	plugin: [
		{
			name: 'WordPress Plugin Boilerplate',
			value: 'wordpress-plugin-boilerplate',
			link: 'https://wppb.me/',
		},
		{
			name: 'Wordpress Plugin Template',
			value: 'wordpress-plugin-template',
			link: 'https:example.com',
		},
		{
			name: 'WPBP',
			value: 'wpbp',
			link: 'https://wpbp.org/',
		},
		{
			name: 'Team51',
			value: 'team51',
			link: 'https://example.com',
		},
	],
	site: [
		{
			name: 'LocalWp',
			value: 'localwp',
			link: 'https://localwp.com/',
		},
		{
			name: 'VIP Go',
			value: 'vip-go',
			link: 'https://vip.wordpress.com/',
		},
		{
			name: 'Team51',
			value: 'team51',
			link: 'https://example.com',
		},
		{
			name: 'Wordpress Playground',
			value: 'wordpress-playground',
			link: 'https://example.com',
		},
	],
};

export const getRepositoryTemplate = ( projectType: keyof typeof REPOSITORY_TEMPLATES ) => {
	return REPOSITORY_TEMPLATES[ projectType ];
};
