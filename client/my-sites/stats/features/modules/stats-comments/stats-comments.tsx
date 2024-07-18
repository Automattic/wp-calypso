import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { comment } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { INSIGHTS_SUPPORT_URL } from '../../../const';
import Comments from '../../../stats-comments';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatsComments: React.FC< StatsDefaultModuleProps > = ( { className } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsComments';
	const moduleTitle = translate( 'Comments' );

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsModule = useShouldGateStats( statType );

	const isRequestingData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, {} )
	);

	const data = useSelector( ( state: StatsStateProps ) =>
		getSiteStatsNormalizedData( state, siteId, statType, {} )
	);

	const hasPosts = useMemo( () => ( data?.posts?.length ?? 0 ) > 0, [ data ] );

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } />
			) }
			{ isRequestingData && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleTitle }
					type={ 3 }
					withHero
				/>
			) }
			{ ( ( ! isRequestingData && hasPosts ) || shouldGateStatsModule ) && (
				// show data or an overlay
				<Comments path="comments" className={ className } />
			) }
			{ ! isRequestingData && ! hasPosts && ! shouldGateStatsModule && (
				// show empty state
				<StatsCard
					className={ className }
					title={ moduleTitle }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ comment }
							description={ translate(
								'Learn about the {{link}}comments{{/link}} your site receives by authors, posts, and pages.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: (
											<a href={ localizeUrl( `${ INSIGHTS_SUPPORT_URL }#all-time-insights` ) } />
										),
									},
									context: 'Stats: Info box label when the Comments module is empty',
								}
							) }
						/>
					}
				/>
			) }
		</>
	);
};

export default StatsComments;
