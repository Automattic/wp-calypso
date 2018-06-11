/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

const tasks = {
	jetpack_brute_force: {
		completedTitle: translate(
			"We've automatically protected you from brute force login attacks."
		),
		completed: true,
	},
	jetpack_spam_filtering: {
		completedTitle: translate( "We've automatically turned on spam filtering." ),
		completed: true,
	},
	jetpack_backups: {
		title: translate( 'Backups & Scanning' ),
		description: translate(
			"Connect your site's server to Jetpack to perform backups, rewinds, and security scans."
		),
		completedTitle: translate( 'You turned on backups and scanning.' ),
		completedButtonText: 'Change',
		duration: translate( '2 min' ),
		url: '/stats/activity/$siteSlug',
	},
	jetpack_monitor: {
		title: translate( 'Jetpack Monitor' ),
		description: translate(
			"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications."
		),
		completedTitle: translate( 'You turned on Jetpack Monitor.' ),
		completedButtonText: 'Change',
		duration: translate( '3 min' ),
		url: '/settings/security/$siteSlug#jetpack-monitor',
		tour: 'jetpackMonitoring',
	},
	jetpack_plugin_updates: {
		title: translate( 'Automatic Plugin Updates' ),
		description: translate(
			'Choose which WordPress plugins you want to keep automatically updated.'
		),
		completedTitle: translate( 'You turned on automatic plugin updates.' ),
		completedButtonText: 'Change',
		duration: translate( '3 min' ),
		url: '/plugins/manage/$siteSlug',
	},
	jetpack_sign_in: {
		title: translate( 'WordPress.com sign in' ),
		description: translate(
			'Manage your log in preferences and two-factor authentication settings.'
		),
		completedTitle: translate( 'You completed your sign in preferences.' ),
		completedButtonText: 'Change',
		duration: translate( '3 min' ),
		url: '/settings/security/$siteSlug',
	},
};

const sequence = [
	'jetpack_brute_force',
	'jetpack_spam_filtering',
	'jetpack_backups',
	'jetpack_monitor',
	'jetpack_plugin_updates',
	'jetpack_sign_in',
];

export function jetpackTasks( checklist ) {
	if ( ! checklist || ! checklist.tasks ) {
		return null;
	}

	return sequence.map( id => {
		const task = tasks[ id ];
		const taskFromServer = checklist.tasks[ id ];

		return { id, ...task, ...taskFromServer };
	} );
}
