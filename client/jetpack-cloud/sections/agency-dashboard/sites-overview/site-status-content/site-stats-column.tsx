import { ShortenedNumber } from '@automattic/components';
import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import { Icon, arrowUp, arrowDown } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useCallback, useContext } from 'react';
import { DATAVIEWS_LIST } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { type Site } from '../../sites-overview/types';
import { SiteStats } from '../types';

type Props = {
	site?: Site;
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

export default function SiteStatsColumn( { site, stats }: Props ) {
	const { setSelectedSiteFeature, setDataViewsState } = useContext( SitesDashboardContext );
	const { total: totalViews, trend: viewsTrend } = stats.views;
	const trendIcon = getTrendIcon( viewsTrend );
	const isA4A = isA8CForAgencies();

	// Open the site's preview pane with the stats tab displayed.
	const openStats = useCallback( () => {
		setDataViewsState( ( prevState: DataViewsState ) => ( {
			...prevState,
			selectedItem: site,
			type: DATAVIEWS_LIST,
		} ) );
		setSelectedSiteFeature( 'jetpack-stats' );
	}, [ site, setSelectedSiteFeature, setDataViewsState ] );

	// When in A4A, the stats column is a clickable button that opens the preview pane.
	if ( isA4A ) {
		return (
			<button
				type="button"
				title={
					translate( '%(totalViews)s views in the last 7 days', { args: { totalViews } } ) as string
				}
				onClick={ openStats }
				className={ clsx(
					'sites-overview__stats-trend',
					`sites-overview__stats-trend__${ viewsTrend }`,
					{ 'button is-borderless': isA4A }
				) }
			>
				{ trendIcon }
				<div className="sites-overview__stats">
					<span className="shortened-number">{ formatNumber( totalViews ) }</span>
				</div>
			</button>
		);
	}

	return (
		<span
			className={ clsx(
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
