import { Button } from '@automattic/components';
import { Icon, arrowUp, arrowDown, external } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate, numberFormat } from 'i18n-calypso';
import ExpandedCard from './expanded-card';
import type { SiteStats } from '../types';

interface Props {
	stats: SiteStats;
	siteUrlWithScheme: string;
	trackEvent: ( eventName: string ) => void;
}

export default function InsightsStats( { stats, siteUrlWithScheme, trackEvent }: Props ) {
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
				className={ clsx( 'site-expanded-content__card-content-score', {
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

	const href = `${ siteUrlWithScheme }/wp-admin/admin.php?page=stats`;

	return (
		<ExpandedCard header={ translate( '7 days insights stats' ) }>
			<div className="site-expanded-content__card-content-container">
				<div className="site-expanded-content__card-content">
					<div className="site-expanded-content__card-content-column">
						<div className="site-expanded-content__card-content-score">
							<span>
								{ numberFormat( data.visitors, {
									numberFormatOptions: {
										notation: 'compact',
										maximumFractionDigits: 1,
									},
								} ) }
							</span>
							{ getTrendContent( data.visitorsTrend, data.visitorsChange ) }
						</div>
						<div className="site-expanded-content__card-content-score-title">
							{ translate( 'Visitors' ) }
						</div>
					</div>
					<div className="site-expanded-content__card-content-column">
						<div className="site-expanded-content__card-content-score">
							<span>
								{ numberFormat( data.views, {
									numberFormatOptions: {
										notation: 'compact',
										maximumFractionDigits: 1,
									},
								} ) }
							</span>
							{ getTrendContent( data.viewsTrend, data.viewsChange ) }
						</div>
						<div className="site-expanded-content__card-content-score-title">
							{ translate( 'Views' ) }
						</div>
					</div>
				</div>
				<div className="site-expanded-content__card-footer">
					<Button
						href={ href }
						target="_blank"
						onClick={ () => trackEvent( 'expandable_block_see_all_stats_click' ) }
						className="site-expanded-content__card-button"
						compact
					>
						{ translate( 'See all stats' ) }
						<Icon
							icon={ external }
							size={ 14 }
							className="site-preview-pane__stats-icon"
							viewBox="0 0 20 20"
						/>
					</Button>
				</div>
			</div>
		</ExpandedCard>
	);
}
