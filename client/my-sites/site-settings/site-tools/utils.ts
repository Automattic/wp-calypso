export const SOURCE_SETTINGS_GENERAL = '/settings/general';
export const SOURCE_SETTINGS_SITE_TOOLS = '/settings/site-tools';
export const SOURCE_SETTINGS_ADMINISTRATION = '/sites/settings/administration';

const allowedSources = [
	SOURCE_SETTINGS_GENERAL,
	SOURCE_SETTINGS_SITE_TOOLS,
	SOURCE_SETTINGS_ADMINISTRATION,
];
export const getSettingsSource = () => {
	let source = new URLSearchParams( window.location.search ).get( 'source' ) || '';
	if ( ! allowedSources.includes( source ) ) {
		// TODO: change the default to /settings/site-tools
		// after we default all sites to the classic style for the wpcom untangle project.
		source = '/settings/general';
	}
	return source;
};
