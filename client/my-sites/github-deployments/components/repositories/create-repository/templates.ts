export const repositoryTemplates = {
	plugin: [
		{
			name: 'WordPress Plugin Boilerplate',
			value: 'githubdeployments-wp-plugin-boilerplate',
			link: 'https://github.com/Automattic/githubdeployments-wp-plugin-boilerplate',
		},
		{
			name: 'Wordpress Plugin Template',
			value: 'githubdeployments-wordpress-plugin-template',
			link: 'https://github.com/Automattic/githubdeployments-wordpress-plugin-template',
		},
		{
			name: 'WordPress Plugin Boilerplate Powered',
			value: 'githubdeployments-plugin-boilerplate-powered',
			link: 'https://github.com/Automattic/githubdeployments-plugin-boilerplate-powered',
		},
		{
			name: 'Team 51 Plugin Scaffold',
			value: 'githubdeployments-team51-plugin-scaffold',
			link: 'https://github.com/Automattic/githubdeployments-team51-plugin-scaffold',
		},
	],
	theme: [
		{
			name: 'WordPress Theme Template',
			value: 'githubdeployments-wordpress-theme-template',
			link: 'https://github.com/Automattic/githubdeployments-wordpress-theme-template',
		},
		{
			name: 'Underscores',
			value: 'githubdeployments-theme-underscores',
			link: 'https://github.com/Automattic/githubdeployments-theme-underscores',
		},
		{
			name: 'Timber',
			value: 'githubdeployments-theme-timber',
			link: 'https://github.com/Automattic/githubdeployments-theme-timber',
		},
		{
			name: 'Sage',
			value: 'githubdeployments-theme-sage',
			link: 'https://github.com/Automattic/githubdeployments-theme-sage',
		},
		{
			name: 'Understrap',
			value: 'githubdeployments-theme-understrap',
			link: 'https://github.com/Automattic/githubdeployments-theme-understrap',
		},
	],
	site: [
		{
			name: 'LocalWp',
			value: 'githubdeployments-site-localwp',
			link: 'https://github.com/Automattic/githubdeployments-site-localwp',
		},
		{
			name: 'VIP Go',
			value: 'githubdeployments-site-vipgo',
			link: 'https://github.com/Automattic/githubdeployments-site-vipgo',
		},
		{
			name: 'Team51 Project Scaffold',
			value: 'githubdeployments-team51-project-scaffold',
			link: 'https://github.com/Automattic/githubdeployments-team51-project-scaffold',
		},
		{
			name: 'Wordpress Playground',
			value: 'githubdeployments-site-wordpress-playground',
			link: 'https://github.com/Automattic/githubdeployments-site-wordpress-playground',
		},
	],
};

export const defaultTemplate = repositoryTemplates.plugin[ 0 ];

export const getRepositoryTemplate = ( projectType: keyof typeof repositoryTemplates ) => {
	return repositoryTemplates[ projectType ];
};
