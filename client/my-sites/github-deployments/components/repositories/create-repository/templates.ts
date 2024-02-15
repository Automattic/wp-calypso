export const repositoryTemplates = {
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
			value: 'githubdeployments-theme-template3',
			link: 'https://roots.io/sage/docs/',
		},
		{
			name: 'Understrap',
			value: 'understrap',
			link: 'https://understrap.com/',
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

export const defaultTemplate = repositoryTemplates.plugin[ 0 ];

export const getRepositoryTemplate = ( projectType: keyof typeof repositoryTemplates ) => {
	return repositoryTemplates[ projectType ];
};
