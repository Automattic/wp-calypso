import { useTranslate } from 'i18n-calypso';

export default function useSitesWalkthroughTour() {
	const translate = useTranslate();

	return [
		{
			id: 'sites-walkthrough-intro',
			popoverPosition: 'bottom right',
			title: translate( 'Manage all your sites' ),
			description: translate( 'Here you can find your sites and detailed overview about each.' ),
		},
		{
			id: 'sites-walkthrough-stats',
			popoverPosition: 'bottom right',
			title: translate( '📊 Stats' ),
			description: translate(
				'Here you can see page view metrics and how they evolved over the last 7 days.'
			),
		},
		{
			id: 'sites-walkthrough-boost',
			popoverPosition: 'bottom right',
			title: translate( '🚀 Boost score rating' ),
			description: translate(
				"Here's a score reflecting your website's load speed. Click 'Get Score' to know your site's speed rating – it's free!"
			),
		},
		{
			id: 'sites-walkthrough-backup',
			popoverPosition: 'bottom right',
			title: translate( '🛡️ Backups' ),
			description: translate(
				'We automatically back up your site and safeguard your data. Restoring is as simple as a single click.'
			),
		},
		{
			id: 'sites-walkthrough-monitor',
			popoverPosition: 'bottom left',
			title: translate( '⏲️ Uptime Monitor' ),
			description: (
				<>
					{ translate(
						"We keep tabs on your site's uptime. Simply toggle this on, and we'll alert you if your site goes down."
					) }
					<br />
					<br />
					{ translate(
						'🟢 With the premium plan, you can tweak notification settings to alert multiple recipients simultaneously.'
					) }
				</>
			),
		},
		{
			id: 'sites-walkthrough-scan',
			popoverPosition: 'bottom right',
			title: translate( '🔍 Scan' ),
			description: translate(
				'We scan your site and flag any detected issues using a traffic light warning system – 🔴 for severe or 🟡 for a warning.'
			),
		},
		{
			id: 'sites-walkthrough-plugins',
			popoverPosition: 'bottom right',
			title: translate( '🔌 Plugin updates' ),
			description: (
				<>
					{ translate(
						"We keep an eye on the status of your plugins for every site. If any plugins require updates, we'll let you know."
					) }
					<br />
					<br />
					{ translate(
						"From here, you can update individually, enable auto-updates, or update all plugins simultaneously. Oh, and it's all free."
					) }
				</>
			),
		},
		{
			id: 'sites-walkthrough-site-preview',
			nextStepOnTargetClick: true,
			popoverPosition: 'bottom right',
			title: translate( '🔍 Detailed views' ),
			description: translate(
				'Click the arrow for detailed insights on stats, site speed performance, recent backups, and monitoring activity trends. Handy, right?'
			),
		},
		{
			id: 'sites-walkthrough-site-preview-tabs',
			popoverPosition: 'bottom right',
			title: translate( '🔍 Detailed site view' ),
			description: (
				<>
					{ translate( "Great! You're now viewing detailed insights." ) }
					<br />
					<br />
					{ translate(
						'Use the tabs to navigate between site speed, backups, Uptime Monitor, activity trends, and plugins.'
					) }
				</>
			),
		},
	];
}
