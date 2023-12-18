import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import MissingPaymentNotification from 'calypso/jetpack-cloud/components/missing-payment-notification';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import type { ReactNode } from 'react';

import './style.scss';

interface Props {
	pageTitle: string;
	showStickyContent: boolean;
	content: ReactNode;
}

export default function SiteContentHeader( { content, pageTitle, showStickyContent }: Props ) {
	const [ divRef, hasCrossed ] = useDetectWindowBoundary();

	const outerDivProps = divRef ? { ref: divRef as React.RefObject< HTMLDivElement > } : {};

	const translate = useTranslate();

	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderDashboardTour = urlParams.get( 'tour' ) === 'dashboard-walkthrough';
	return (
		<>
			<MissingPaymentNotification />

			<div className="sites-overview__viewport" { ...outerDivProps }>
				<div
					className={ classNames( 'sites-overview__page-title-container', {
						'is-sticky': showStickyContent && hasCrossed,
					} ) }
				>
					<div className="sites-overview__page-heading">
						<h2 className="sites-overview__page-title">{ pageTitle }</h2>
						<div className="sites-overview__page-subtitle">
							{ translate( 'Manage all your Jetpack sites from one location' ) }
						</div>
					</div>

					{ content }
				</div>
			</div>
			{ shouldRenderDashboardTour && (
				<GuidedTour
					className="sites-overview__dashboard-guided-tour"
					preferenceName="jetpack-cloud-sites-overview-dashboard-walkthrough-tour"
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
							title: translate( '📊 7 days insights stats' ),
							description: translate( 'Here you can see key metrics (visitors and views).' ),
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
							target: '.site-table__table tr:first-child td.jetpack-cloud-site-column__monitor',
							popoverPosition: 'bottom right',
							title: translate( '⏲️ Uptime Monitor' ),
							description:
								translate(
									"We keep tabs on your site's uptime. Simply toggle this on, and we'll alert you if your site goes down."
								) +
								'\n\n' +
								translate(
									'🚩 With the premium plan, you can tweak notification settings to alert multiple recipients simultaneously.'
								),
						},
						{
							target: '.site-table__table tr:first-child td.jetpack-cloud-site-column__plugin',
							popoverPosition: 'bottom right',
							title: translate( '🔌 Plugin updates' ),
							description:
								translate(
									"We keep an eye on the status of your plugins for every site. If any plugins require updates, we'll let you know."
								) +
								'\n\n' +
								translate(
									"From here, you can update individually, enable auto-updates, or update all plugins simultaneously. Oh, and it's all free."
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
			) }
		</>
	);
}
