const REPOSITORY_TEMPLATES = {
	theme: [
		{
			name: 'Underscores',
			value: 'underscores',
		},
		{
			name: 'Timber',
			value: 'timber',
		},
		{
			name: 'Sage',
			value: 'sage',
		},
		{
			name: 'Understrap',
			value: 'understrap',
		},
	],
	plugin: [
		{
			name: 'WordPress Plugin Boilerplate',
			value: 'wordpress-plugin-boilerplate',
		},
		{
			name: 'Wordpress Plugin Template',
			value: 'wordpress-plugin-template',
		},
		{
			name: 'WPBP',
			value: 'wpbp',
		},
		{
			name: 'Team51',
			value: 'team51',
		},
	],
	site: [
		{
			name: 'LocalWp',
			value: 'localwp',
		},
		{
			name: 'VIP Go',
			value: 'vip-go',
		},
		{
			name: 'Team51',
			value: 'team51',
		},
		{
			name: 'Wordpress Playground',
			value: 'wordpress-playground',
		},
	],
};

export const getRepositoryTemplate = ( projectType: keyof typeof REPOSITORY_TEMPLATES ) => {
	return REPOSITORY_TEMPLATES[ projectType ];
};
