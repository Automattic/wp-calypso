import classNames from 'classnames';
import BackupStorage from './backup-storage';
import BoostSitePerformance from './boost-site-performance';
import InsightsStats from './insights-stats';
import type { Site } from '../types';

import './style.scss';

interface Props {
	site: Site;
	columns?: string[];
	isSmallScreen?: boolean;
}

const defaultColumns = [ 'stats', 'boost', 'backup' ];

export default function SiteExpandedContent( {
	site,
	columns = defaultColumns,
	isSmallScreen = false,
}: Props ) {
	const stats = site.site_stats;
	const boostData = site.jetpack_boost_scores;
	const siteUrlWithScheme = site.url_with_scheme;

	return (
		<div
			className={ classNames( 'site-expanded-content', {
				'is-small-screen': isSmallScreen,
			} ) }
		>
			{ columns.includes( 'stats' ) && stats && (
				<InsightsStats stats={ stats } siteUrlWithScheme={ siteUrlWithScheme } />
			) }
			{ columns.includes( 'boost' ) && (
				<BoostSitePerformance
					boostData={ boostData }
					siteUrlWithScheme={ siteUrlWithScheme }
					hasBoost={ site.has_boost }
				/>
			) }
			{ columns.includes( 'backup' ) && stats && <BackupStorage site={ site } /> }
		</div>
	);
}
