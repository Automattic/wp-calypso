import { useTranslate } from 'i18n-calypso';
import SiteContent from './site-content';

import './style.scss';

export default function SitesOverview() {
	const translate = useTranslate();
	return (
		<div className="sites-overview">
			<h2 className="sites-overview__page-title">{ translate( 'Dashboard' ) }</h2>
			<div className="sites-overview__page-subtitle">
				{ translate( 'Manage all your Jetpack sites from one location' ) }
			</div>
			<SiteContent />
		</div>
	);
}
