const conflictingSeoPlugins = [
	'Yoast SEO',
	'Yoast SEO Premium',
	'All In One SEO Pack',
	'All in One SEO Pack Pro',
];

export const getConflictingSeoPlugins = ( activePlugins ) =>
	activePlugins
		.filter( ( { name } ) => conflictingSeoPlugins.includes( name ) )
		.map( ( { name, slug } ) => ( { name, slug } ) );

export const getFirstConflictingPlugin = ( activePlugins ) =>
	getConflictingSeoPlugins( activePlugins )[ 0 ];
