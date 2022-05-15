import { ReactElement } from 'react';
import SiteContent from './site-content';

import './style.scss';

export default function SitesOverview(): ReactElement {
	return (
		<div className="sites-overview">
			<SiteContent />
		</div>
	);
}
