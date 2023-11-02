import { ShortenedNumber } from '@automattic/components';
import { Icon, arrowUp, arrowDown } from '@wordpress/icons';
import classNames from 'classnames';
import { SiteStats } from '../types';

type Props = {
	stats: SiteStats;
};

const getTrendIcon = ( viewsTrend: 'up' | 'down' ) => {
	if ( viewsTrend === 'up' ) {
		return arrowUp;
	} else if ( viewsTrend === 'down' ) {
		return arrowDown;
	}
};

export default function SiteStatsColumn( { stats }: Props ) {
	const { total: totalViews, trend: viewsTrend } = stats.views;
	if ( viewsTrend === 'same' ) {
		return (
			<>
				<span className="sites-overview__stats-trend sites-overview__stats-trend__same" />
				<div className="sites-overview__stats">
					<ShortenedNumber value={ totalViews } />
				</div>
			</>
		);
	}
	const trendIcon = getTrendIcon( viewsTrend );
	return (
		<span
			className={ classNames( 'sites-overview__stats-trend', {
				'sites-overview__stats-trend__up': viewsTrend === 'up',
				'sites-overview__stats-trend__down': viewsTrend === 'down',
			} ) }
		>
			{ trendIcon && <Icon icon={ trendIcon } size={ 16 } /> }
			<div className="sites-overview__stats">
				<ShortenedNumber value={ totalViews } />
			</div>
		</span>
	);
}
