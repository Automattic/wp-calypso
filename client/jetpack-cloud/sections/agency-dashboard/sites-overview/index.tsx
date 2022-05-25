import { useTranslate } from 'i18n-calypso';
import SiteContent from './site-content';
import SiteWelcomeBanner from './site-welcome-banner';
import type { ReactElement } from 'react';

import './style.scss';

export default function SitesOverview(): ReactElement {
	const translate = useTranslate();
	return (
		<div className="sites-overview">
			<SiteWelcomeBanner isDashboardView />
			<div className="sites-overview__page-title-container">
				<h2 className="sites-overview__page-title">{ translate( 'Dashboard' ) }</h2>
				<div className="sites-overview__page-subtitle">
					{ translate( 'Manage all your Jetpack sites from one location' ) }
				</div>
			</div>
			<SiteContent />
		</div>
	);
}
