/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Returns the localized duration of a task in given minutes.
 *
 * @param  {Number} minutes Number of minutes.
 * @return {String} Localized duration.
 */
export function getJetpackChecklistTaskDuration( minutes ) {
	return translate( '%d minute', '%d minutes', { count: minutes, args: [ minutes ] } );
}

export const JETPACK_CHECKLIST_TASKS = {
	jetpack_monitor: {
		title: translate( 'Downtime Monitoring' ),
		description: translate(
			"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications."
		),
		completedButtonText: translate( 'Change', { context: 'verb' } ),
		completedTitle: translate( 'You turned on Downtime Monitoring.' ),
		getUrl: siteSlug => `/settings/security/${ siteSlug }`,
		duration: getJetpackChecklistTaskDuration( 3 ),
		tourId: 'jetpackMonitoring',
	},
	jetpack_plugin_updates: {
		title: translate( 'Automatic Plugin Updates' ),
		description: translate(
			'Choose which WordPress plugins you want to keep automatically updated.'
		),
		completedButtonText: translate( 'Change', { context: 'verb' } ),
		completedTitle: translate( 'You turned on automatic plugin updates.' ),
		getUrl: siteSlug => `/plugins/manage/${ siteSlug }`,
		duration: getJetpackChecklistTaskDuration( 3 ),
		tourId: 'jetpackPluginUpdates',
	},
	jetpack_sign_in: {
		title: translate( 'WordPress.com sign in' ),
		description: translate(
			'Manage your log in preferences and two-factor authentication settings.'
		),
		completedButtonText: translate( 'Change', { context: 'verb' } ),
		completedTitle: translate( 'You completed your sign in preferences.' ),
		getUrl: siteSlug => `/settings/security/${ siteSlug }`,
		duration: getJetpackChecklistTaskDuration( 3 ),
		tourId: 'jetpackSignIn',
	},
};

export const JETPACK_CHECKLIST_TASK_AKISMET = {
	title: translate( "We're automatically turning on spam filtering." ),
	completedTitle: translate( "We've automatically turned on spam filtering." ),
};

export const JETPACK_CHECKLIST_TASK_PROTECT = {
	title: translate( "We've automatically protected you from brute force login attacks." ),
};

export const JETPACK_CHECKLIST_TASK_BACKUPS_REWIND = {
	title: translate( 'Backup and Scan' ),
	description: translate(
		"Connect your site's server to Jetpack to perform backups, restores, and security scans."
	),
	completedButtonText: translate( 'Change', { context: 'verb' } ),
	completedTitle: translate( 'You turned on Backup and Scan.' ),
	getUrl: siteSlug => `/settings/security/${ siteSlug }`,
	duration: getJetpackChecklistTaskDuration( 3 ),
};

export const JETPACK_CHECKLIST_TASK_BACKUPS_VAULTPRESS = {
	title: translate( "We're automatically turning on Backup and Scan." ),
	completedTitle: translate( "We've automatically turned on Backup and Scan." ),
};
