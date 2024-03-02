export interface RepositoryTemplate {
	name: string;
	repositoryName: string;
	link: string;
	workflowFilename?: string;
}

export const repositoryTemplates = {
	plugin: [
		{
			name: 'WordPress Plugin Boilerplate',
			repositoryName: 'githubdeployments-wp-plugin-boilerplate',
			link: 'https://github.com/Automattic/githubdeployments-wp-plugin-boilerplate',
		},
		{
			name: 'WordPress Plugin Template',
			repositoryName: 'githubdeployments-wordpress-plugin-template',
			link: 'https://github.com/Automattic/githubdeployments-wordpress-plugin-template',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
		{
			name: 'WordPress Plugin Boilerplate Powered',
			repositoryName: 'githubdeployments-plugin-boilerplate-powered',
			link: 'https://github.com/Automattic/githubdeployments-plugin-boilerplate-powered',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
		{
			name: 'Team 51 Plugin Scaffold',
			repositoryName: 'githubdeployments-team51-plugin-scaffold',
			link: 'https://github.com/Automattic/githubdeployments-team51-plugin-scaffold',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
	],
	theme: [
		{
			name: 'WordPress Theme Template',
			repositoryName: 'githubdeployments-wordpress-theme-template',
			link: 'https://github.com/Automattic/githubdeployments-wordpress-theme-template',
		},
		{
			name: 'Underscores',
			repositoryName: 'githubdeployments-theme-underscores',
			link: 'https://github.com/Automattic/githubdeployments-theme-underscores',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
		{
			name: 'Timber',
			repositoryName: 'githubdeployments-theme-timber',
			link: 'https://github.com/Automattic/githubdeployments-theme-timber',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
		{
			name: 'Sage',
			repositoryName: 'githubdeployments-theme-sage',
			link: 'https://github.com/Automattic/githubdeployments-theme-sage',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
		{
			name: 'Understrap',
			repositoryName: 'githubdeployments-theme-understrap',
			link: 'https://github.com/Automattic/githubdeployments-theme-understrap',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
	],
	site: [
		{
			name: 'Local',
			repositoryName: 'githubdeployments-site-localwp',
			link: 'https://github.com/Automattic/githubdeployments-site-localwp',
		},
		{
			name: 'VIP Go',
			repositoryName: 'githubdeployments-site-vipgo',
			link: 'https://github.com/Automattic/githubdeployments-site-vipgo',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
		{
			name: 'Team51 Project Scaffold',
			repositoryName: 'githubdeployments-team51-project-scaffold',
			link: 'https://github.com/Automattic/githubdeployments-team51-project-scaffold',
			workflowFilename: '.github/workflows/dotcom-build-artifact.yml',
		},
		{
			name: 'WordPress Playground',
			repositoryName: 'githubdeployments-site-wordpress-playground',
			link: 'https://github.com/Automattic/githubdeployments-site-wordpress-playground',
		},
	],
} satisfies Record< string, RepositoryTemplate[] >;

export const defaultTemplate = repositoryTemplates.plugin[ 0 ];

export const getRepositoryTemplate = ( projectType: keyof typeof repositoryTemplates ) => {
	return repositoryTemplates[ projectType ];
};
