export const PLUGINS_PATH = '/plugins';
export const PLUGINS_MANAGE_PATH = `${ PLUGINS_PATH }/manage`;
export const PLUGINS_SCHEDULED_UPDATES_PATH = `${ PLUGINS_PATH }/scheduled-updates`;
export const PLUGINS_SCHEDULED_UPDATES_NEW_PATH = `${ PLUGINS_SCHEDULED_UPDATES_PATH }/new`;

export const getPluginManagePath = ( pluginSlug: string ) =>
	`${ PLUGINS_MANAGE_PATH }/${ pluginSlug }`;

export const getScheduledUpdatesEditPath = ( scheduleId: string ) =>
	`${ PLUGINS_SCHEDULED_UPDATES_PATH }/edit/${ scheduleId }`;
