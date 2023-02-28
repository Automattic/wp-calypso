import { Button, ShortenedNumber } from '@automattic/components';
import { Icon, arrowUp, arrowDown } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import ExpandedCard from './expanded-card';
import type { SiteStats } from '../types';

interface Props {
	stats: SiteStats;
}

export default function InsightsStats( { stats }: Props ) {
	const translate = useTranslate();

	const data = {
		visitors: stats.visitors.total,
		visitorsChange: stats.visitors.trend_change,
		visitorsTrend: stats.visitors.trend,
		views: stats.views.total,
		viewsChange: stats.views.trend_change,
		viewsTrend: stats.views.trend,
	};

	const getTrendIcon = ( trend: string ) => {
		if ( trend === 'up' ) {
			return arrowUp;
		}
		if ( trend === 'down' ) {
			return arrowDown;
		}
		return null;
	};

	const getTrendContent = ( trend: string, change: number ) => {
		const trendIcon = getTrendIcon( trend );
		return (
			<span
				className={ classNames( 'site-expanded-content__card-content-count', {
					'is-up': trend === 'up',
					'is-down': trend === 'down',
				} ) }
			>
				<span>
					{ trendIcon && (
						<>
							<Icon size={ 16 } icon={ trendIcon } />
							{ change }
						</>
					) }
				</span>
			</span>
		);
	};

	return (
		<ExpandedCard header={ translate( '7 days insights stats' ) }>
			<div className="site-expanded-content__card-content">
				<div className="site-expanded-content__card-content-column">
					<div className="site-expanded-content__card-content-count">
						<ShortenedNumber value={ data.visitors } />
						{ getTrendContent( data.visitorsTrend, data.visitorsChange ) }
					</div>
					<div className="site-expanded-content__card-content-count-title">
						{ translate( 'Visitors' ) }
					</div>
				</div>
				<div className="site-expanded-content__card-content-column">
					<div className="site-expanded-content__card-content-count">
						<ShortenedNumber value={ data.views } />
						{ getTrendContent( data.viewsTrend, data.viewsChange ) }
					</div>
					<div className="site-expanded-content__card-content-count-title">
						{ translate( 'Views' ) }
					</div>
				</div>
			</div>
			<div className="site-expanded-content__card-footer">
				<Button className="site-expanded-content__card-button" compact>
					{ translate( 'See all stats' ) }
				</Button>
			</div>
		</ExpandedCard>
	);
}
