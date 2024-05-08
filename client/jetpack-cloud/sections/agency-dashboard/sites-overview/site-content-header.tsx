import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import MissingPaymentNotification from 'calypso/jetpack-cloud/components/missing-payment-notification';
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import AddNewSiteTourStep1 from '../../onboarding-tours/add-new-site-tour-step-1';
import DashboardWalkthroughTour from '../../onboarding-tours/dashboard-walkthrough-tour';
import EnableMonitorTourStep1 from '../../onboarding-tours/enable-monitor-tour-step-1';
import EnableMonitorTourStep2 from '../../onboarding-tours/enable-monitor-tour-step-2';
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

	return (
		<>
			<MissingPaymentNotification />

			<div className="sites-overview__viewport" { ...outerDivProps }>
				<div
					className={ clsx( 'sites-overview__page-title-container', {
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
			<AddNewSiteTourStep1 />
			<EnableMonitorTourStep1 />
			<EnableMonitorTourStep2 />
			<DashboardWalkthroughTour />
		</>
	);
}
