/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export const tasks = [
	{
		id: 'jetpack_brute_force',
		completedTitle: translate(
			"We've automatically protected you from brute force login attacks."
		),
		completed: true,
	},
	{
		id: 'jetpack_spam_filtering',
		completedTitle: translate( "We've automatically turned on spam filtering." ),
		completed: true,
	},
	{
		id: 'jetpack_backups',
		title: translate( 'Backups & Scanning' ),
		description: translate(
			"Connect your site's server to Jetpack to perform backups, rewinds, and security scans."
		),
		completed: true,
		completedTitle: translate( 'You turned on backups and scanning.' ),
		completedButtonText: translate( 'Change' ),
		duration: translate( '2 min' ),
		url: '/stats/activity/$siteSlug',
	},
	{
		id: 'jetpack_monitor',
		title: translate( 'Jetpack Monitor' ),
		description: translate(
			"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications."
		),
		completedTitle: translate( 'You turned on Jetpack Monitor.' ),
		completedButtonText: translate( 'Change' ),
		duration: translate( '3 min' ),
		tour: 'jetpackMonitoring',
		url: '/settings/security/$siteSlug',
	},
	{
		id: 'jetpack_plugin_updates',
		title: translate( 'Automatic Plugin Updates' ),
		description: translate(
			'Choose which WordPress plugins you want to keep automatically updated.'
		),
		completedTitle: translate( 'You turned on automatic plugin updates.' ),
		completedButtonText: translate( 'Change' ),
		duration: translate( '3 min' ),
		url: '/plugins/manage/$siteSlug',
	},
	{
		id: 'jetpack_sign_in',
		title: translate( 'WordPress.com sign in' ),
		description: translate(
			'Manage your log in preferences and two-factor authentication settings.'
		),
		completedTitle: translate( 'You completed your sign in preferences.' ),
		completedButtonText: translate( 'Change' ),
		duration: translate( '3 min' ),
		tour: 'jetpackSignIn',
		url: '/settings/security/$siteSlug',
	},
];
