import { StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { megaphone } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { SUPPORT_URL } from '../../../const';
import StatsModule from '../../../stats-module';
import { StatsEmptyActionSocial } from '../shared';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

const StatsReferrers: React.FC< StatsDefaultModuleProps > = ( {
	period,
	query,
	moduleStrings,
	className,
	debugLoaders,
} ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = 'statsReferrers';

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsReferrers = useShouldGateStats( statType );

	// TODO: sort out the state shape.
	const requesting = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, query )
	);
	const data = useSelector( ( state ) =>
		getSiteStatsNormalizedData( state, siteId, statType, query )
	) as [ id: number, label: string ]; // TODO: get post shape and share in an external type file.

	const isRequestingData = debugLoaders || ( requesting && ! data );

	return (
		<>
			{ siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
			) }
			{ isRequestingData && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleStrings.title }
					type={ 2 }
				/>
			) }
			{ /* TODO: consider supressing <StatsModule /> empty state */ }
			{ ( ! isRequestingData && !! data.length ) || shouldGateStatsReferrers ? (
				<StatsModule
					path="referrers"
					moduleStrings={ moduleStrings }
					period={ period }
					query={ query }
					statType={ statType }
					showSummaryLink
					className={ className } // TODO: extend with a base class after adding skeleton loaders
				/>
			) : (
				<StatsCard
					className={ clsx( 'stats-card--empty-variant', className ) } // when removing stats/empty-module-traffic add this to the root of the card
					title={ moduleStrings.title }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ megaphone }
							description={ translate(
								"We'll show you which websites are {{link}}referring visitors{{/link}} to your site.",
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a href={ localizeUrl( `${ SUPPORT_URL }#referrers` ) } />,
									},
									context: 'Stats: Info box label when the Referrers module is empty',
								}
							) }
							cards={ <StatsEmptyActionSocial from="module_referrers" /> }
						/>
					}
				/>
			) }
		</>
	);
};

export default StatsReferrers;
