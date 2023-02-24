import InsightsStats from './insights-stats';
import type { SiteNode } from '../types';

import './style.scss';

interface Props {
	site: SiteNode;
}

const columns = [ 'stats' ];

export default function SiteExpandedContent( { site }: Props ) {
	const stats = site.value?.site_stats;

	return (
		<div className="site-expanded-content">
			{ columns.includes( 'stats' ) && stats && <InsightsStats stats={ stats } /> }
		</div>
	);
}
