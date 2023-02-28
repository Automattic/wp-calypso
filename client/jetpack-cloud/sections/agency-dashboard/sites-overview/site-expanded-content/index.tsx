import InsightsStats from './insights-stats';
import type { Site } from '../types';

import './style.scss';

interface Props {
	site: Site;
	columns?: string[];
}

const defaultColumns = [ 'stats' ];

export default function SiteExpandedContent( {
	site,
	columns = defaultColumns,
}: Props ) {
	const stats = site.site_stats;

	return (
		<div className="site-expanded-content">
			{ columns.includes( 'stats' ) && stats && <InsightsStats stats={ stats } /> }
		</div>
	);
}
