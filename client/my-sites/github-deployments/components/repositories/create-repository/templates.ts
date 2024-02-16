export const repositoryTemplates = {
	plugin: [
		{
			name: 'WordPress Plugin Boilerplate',
			value: 'githubdeployments-plugin-template1',
			link: 'https://github.com/Automattic/githubdeployments-plugin-template1',
		},
		{
			name: 'Wordpress Plugin Template',
			value: 'githubdeployments-plugin-template2',
			link: 'https://github.com/Automattic/githubdeployments-plugin-template2',
		},
		{
			name: 'WordPress Plugin Boilerplate Powered',
			value: 'githubdeployments-plugin-template3',
			link: 'https://github.com/Automattic/githubdeployments-plugin-template3',
		},
		{
			name: 'Team 51 Plugin Scaffold',
			value: 'githubdeployments-plugin-template4',
			link: 'https://github.com/Automattic/githubdeployments-plugin-template4',
		},
	],
	theme: [
		{
			name: 'WordPress Theme Template',
			value: 'githubdeployments-theme-template5',
			link: 'https://github.com/Automattic/githubdeployments-theme-template5',
		},
		{
			name: 'Underscores',
			value: 'githubdeployments-theme-template1',
			link: 'https://github.com/Automattic/githubdeployments-theme-template1',
		},
		{
			name: 'Timber',
			value: 'githubdeployments-theme-template2',
			link: 'https://github.com/Automattic/githubdeployments-theme-template2',
		},
		{
			name: 'Sage',
			value: 'githubdeployments-theme-template3',
			link: 'https://github.com/Automattic/githubdeployments-theme-template3',
		},
		{
			name: 'Understrap',
			value: 'githubdeployments-theme-template4',
			link: 'https://github.com/Automattic/githubdeployments-theme-template4',
		},
	],
	site: [
		{
			name: 'LocalWp',
			value: 'githubdeployments-site-template1',
			link: 'https://github.com/Automattic/githubdeployments-site-template1',
		},
		{
			name: 'VIP Go',
			value: 'githubdeployments-site-template2',
			link: 'https://github.com/Automattic/githubdeployments-site-template2',
		},
		{
			name: 'Team51 Project Scaffold',
			value: 'githubdeployments-site-template3',
			link: 'https://github.com/Automattic/githubdeployments-site-template3',
		},
		{
			name: 'Wordpress Playground',
			value: 'githubdeployments-site-template4',
			link: 'https://github.com/Automattic/githubdeployments-site-template4',
		},
	],
};

export const defaultTemplate = repositoryTemplates.plugin[ 0 ];

export const getRepositoryTemplate = ( projectType: keyof typeof repositoryTemplates ) => {
	return repositoryTemplates[ projectType ];
};
