export const JETPACK_CLOUD_SECTIONS_DEFINITION = [
	{
		name: 'jetpack-cloud',
		paths: [ '/' ],
		module: 'jetpack-cloud',
		secondary: true,
		group: 'jetpack-cloud',
		enableLoggedOut: true,
	},
	{
		name: 'backups',
		paths: [ '/backups' ],
		module: 'landing/jetpack-cloud/sections/backups',
		secondary: true,
		group: 'jetpack-cloud',
	},
	{
		name: 'scan',
		paths: [ '/scan' ],
		module: 'landing/jetpack-cloud/sections/scan',
		secondary: true,
		group: 'jetpack-cloud',
	},
	{
		name: 'plugins',
		paths: [ '/plugins' ],
		module: 'my-sites/plugins',
		secondary: true,
		group: 'sites',
	},
];
