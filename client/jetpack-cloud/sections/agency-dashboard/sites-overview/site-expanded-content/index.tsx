import classNames from 'classnames';
import BoostSitePerformance from './boost-site-performance';
import InsightsStats from './insights-stats';
import type { Site } from '../types';

import './style.scss';

interface Props {
	site: Site;
	columns?: string[];
	isSmallScreen?: boolean;
}

const defaultColumns = [ 'stats', 'boost' ];

export default function SiteExpandedContent( {
	site,
	columns = defaultColumns,
	isSmallScreen = false,
}: Props ) {
	const stats = site.site_stats;
	const boostData = site.jetpack_boost_scores;

	return (
		<div
			className={ classNames( 'site-expanded-content', {
				'is-small-screen': isSmallScreen,
			} ) }
		>
			{ columns.includes( 'stats' ) && stats && <InsightsStats stats={ stats } /> }
			{ columns.includes( 'boost' ) && (
				// FIXME: hasBoost is a temporary prop to show the component
				<BoostSitePerformance boostData={ boostData } hasBoost={ true } />
			) }
		</div>
	);
}
