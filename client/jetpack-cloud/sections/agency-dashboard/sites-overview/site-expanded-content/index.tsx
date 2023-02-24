import InsightsStats from './insights-stats';
import type { Site } from '../types';

import './style.scss';

interface Props {
	site: Site;
}

const columns = [ 'stats' ];

export default function SiteExpandedContent( { site }: Props ) {
	const stats = site.site_stats;

	return (
		<div className="site-expanded-content">
			{ columns.includes( 'stats' ) && stats && <InsightsStats stats={ stats } /> }
		</div>
	);
}
