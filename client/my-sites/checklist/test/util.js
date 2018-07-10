/** @format */

/**
 * Internal dependencies
 */
import { mergeObjectIntoArrayById } from '../util';

describe( 'mergeObjectIntoArrayById', () => {
	const arr = [
		{
			id: 'jetpack_spam_filtering',
			completedTitle: "We've automatically turned on spam filtering.",
			completed: true,
		},
		{
			id: 'jetpack_backups',
			title: 'Backups & Scanning',
			description:
				"Connect your site's server to Jetpack to perform backups, rewinds, and security scans.",
			completed: true,
			completedTitle: 'You turned on backups and scanning.',
			completedButtonText: 'Change',
			duration: '2 min',
			url: '/stats/activity/$siteSlug',
		},
		{
			id: 'jetpack_monitor',
			title: 'Jetpack Monitor',
			description:
				"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications.",
			completedTitle: 'You turned on Jetpack Monitor.',
			completedButtonText: 'Change',
			duration: '3 min',
			tour: 'jetpackMonitoring',
			url: '/settings/security/$siteSlug',
		},
	];
	const obj = {
		jetpack_spam_filtering: { completed: true },
		jetpack_backups: { completed: false },
		jetpack_monitor: { completed: true },
	};

	test( 'feature-flag server-side-render should enable SSR (default behavior)', () => {
		expect( mergeObjectIntoArrayById( arr, obj ) ).toEqual( [
			{
				id: 'jetpack_spam_filtering',
				completedTitle: "We've automatically turned on spam filtering.",
				completed: true,
			},
			{
				id: 'jetpack_backups',
				title: 'Backups & Scanning',
				description:
					"Connect your site's server to Jetpack to perform backups, rewinds, and security scans.",
				completed: false,
				completedTitle: 'You turned on backups and scanning.',
				completedButtonText: 'Change',
				duration: '2 min',
				url: '/stats/activity/$siteSlug',
			},
			{
				id: 'jetpack_monitor',
				title: 'Jetpack Monitor',
				description:
					"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications.",
				completed: true,
				completedTitle: 'You turned on Jetpack Monitor.',
				completedButtonText: 'Change',
				duration: '3 min',
				tour: 'jetpackMonitoring',
				url: '/settings/security/$siteSlug',
			},
		] );
	} );
} );
