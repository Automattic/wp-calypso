import SiteContent from './site-content';
import type { ReactElement } from 'react';

import './style.scss';

export default function SitesOverview(): ReactElement {
	return (
		<div className="sites-overview">
			<SiteContent />
		</div>
	);
}
