import { ShortenedNumber } from '@automattic/components';
import { Icon, arrowUp, arrowDown } from '@wordpress/icons';
import classNames from 'classnames';
import { SiteStats } from '../types';

type Props = {
	stats: SiteStats;
};

const getTrendIcon = ( viewsTrend: 'up' | 'down' | 'same' ) => {
	switch ( viewsTrend ) {
		case 'up':
			return <Icon icon={ arrowUp } size={ 16 } />;
		case 'down':
			return <Icon icon={ arrowDown } size={ 16 } />;
		default:
			return <span className="empty-icon" />;
	}
};

export default function SiteStatsColumn( { stats }: Props ) {
	const { total: totalViews, trend: viewsTrend } = stats.views;
	const trendIcon = getTrendIcon( viewsTrend );
	return (
		<span
			className={ classNames(
				'sites-overview__stats-trend',
				`sites-overview__stats-trend__${ viewsTrend }`
			) }
		>
			{ trendIcon }

			<div className="sites-overview__stats">
				<ShortenedNumber value={ totalViews } />
			</div>
		</span>
	);
}
