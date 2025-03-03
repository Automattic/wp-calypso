import config from '@automattic/calypso-config';
import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { mapMarker } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL, JETPACK_SUPPORT_URL_TRAFFIC } from '../../../const';
import Geochart from '../../../geochart';
import StatsModule from '../../../stats-module';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

import './style.scss';

const StatsCountries: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
	summaryUrl,
	summary,
	listItemClassName,
	isRealTime = false,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsCountryViews';
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const supportUrl = isOdysseyStats ? JETPACK_SUPPORT_URL_TRAFFIC : SUPPORT_URL;

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsModule = useShouldGateStats( statType );

	// TODO: Determine if data is being requested for real-time stats.
	const isRequestingData =
		useSelector( ( state: StatsStateProps ) =>
			isRequestingSiteStatsForQuery( state, siteId, statType, query )
		) && ! isRealTime;
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ];

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ isRequestingData && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleStrings.title }
					type={ 3 }
					withHero
				/>
			) }
			{ ( ( ! isRequestingData && !! data?.length ) || shouldGateStatsModule ) && (
				// show data or an overlay
				<StatsModule
					path="countryviews"
					titleNodes={
						<StatsInfoArea>
							{ translate( 'Stats on visitors and their {{link}}viewing location{{/link}}.', {
								comment: '{{link}} links to support documentation.',
								components: {
									link: (
										<a
											target="_blank"
											rel="noreferrer"
											href={ localizeUrl( `${ supportUrl }#countries` ) }
										/>
									),
								},
								context: 'Stats: Link in a popover for Countries module when the module has data',
							} ) }
						</StatsInfoArea>
					}
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType={ statType }
					showSummaryLink={ !! summary }
					className={ className }
					summary={ summary }
					listItemClassName={ listItemClassName }
					skipQuery
					isRealTime={ isRealTime }
				>
					<Geochart query={ query } skipQuery isRealTime={ isRealTime } />
				</StatsModule>
			) }
			{ ! isRequestingData && ! data?.length && ! shouldGateStatsModule && (
				// show empty state
				<StatsCard
					className={ className }
					title={ translate( 'Locations' ) }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ mapMarker }
							description={ translate(
								'Stats on visitors and their {{link}}viewing location{{/link}} will appear here to learn from where you are getting visits.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<a
												target="_blank"
												rel="noreferrer"
												href={ localizeUrl( `${ supportUrl }#countries` ) }
											/>
										),
									},
									context: 'Stats: Info box label when the Countries module is empty',
								}
							) }
						/>
					}
					footerAction={
						summaryUrl
							? {
									url: summaryUrl,
									label: translate( 'View more' ),
							  }
							: undefined
					}
				/>
			) }
		</>
	);
};

export default StatsCountries;
