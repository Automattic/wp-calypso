import { useTranslate } from 'i18n-calypso';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME } from '../constants';

import '../style.scss';

export default function DashboardWalkthroughTour() {
	const translate = useTranslate();

	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderDashboardTour = urlParams.get( 'tour' ) === 'dashboard-walkthrough';

	return (
		shouldRenderDashboardTour && (
			<GuidedTour
				className="onboarding-tours__guided-tour"
				preferenceName={ JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'dashboardWalkthrough' ] }
				redirectAfterTourEnds="/overview"
				tours={ [
					{
						target: "a.section-nav-tab__link[tabindex='0']",
						popoverPosition: 'bottom right',
						title: translate( 'Manage all your sites' ),
						description: translate(
							'Here you can find your sites and detailed overview about each.'
						),
					},
					{
						target: '.site-table__table tr:first-child td.jetpack-cloud-site-column__stats',
						popoverPosition: 'bottom right',
						title: translate( '📊 Stats' ),
						description: translate(
							'Here you can see page view metrics and how they evolved over the last 7 days.'
						),
					},
					{
						target: '.site-table__table tr:first-child td.jetpack-cloud-site-column__boost',
						popoverPosition: 'bottom right',
						title: translate( '🚀 Boost score rating' ),
						description: translate(
							"Here's a score reflecting your website's load speed. Click 'Get Score' to know your site's speed rating – it's free!"
						),
					},
					{
						target: '.site-table__table tr:first-child td.jetpack-cloud-site-column__backup',
						popoverPosition: 'bottom right',
						title: translate( '🛡️ Backups' ),
						description: translate(
							'We automatically back up your site and safeguard your data. Restoring is as simple as a single click.'
						),
					},
					{
						target: '.site-table__table tr:first-child td.jetpack-cloud-site-column__scan',
						popoverPosition: 'bottom right',
						title: translate( '🔍 Scan' ),
						description: translate(
							'We scan your site and flag any detected issues using a traffic light warning system – 🔴 for severe or 🟡 for a warning.'
						),
					},
					{
						target:
							'.site-table__table tr:first-child td.jetpack-cloud-site-column__monitor .toggle-activate-monitoring__toggle-button',
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
						target: '.site-table__table tr:first-child td.jetpack-cloud-site-column__plugin',
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
						target: '.site-table__table tr:first-child td.site-table__expand-row',
						popoverPosition: 'bottom right',
						title: translate( '🔍 Detailed views' ),
						description: translate(
							'Click the arrow for detailed insights on stats, site speed performance, recent backups, and monitoring activity trends. Handy, right?'
						),
					},
				] }
			/>
		)
	);
}
