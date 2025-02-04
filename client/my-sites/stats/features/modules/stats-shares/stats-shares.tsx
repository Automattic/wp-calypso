import config from '@automattic/calypso-config';
import { StatsCard } from '@automattic/components';
import { share } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import EmptyModuleCard from 'calypso/my-sites/stats/components/empty-module-card/empty-module-card';
import {
	StatsEmptyActionAI,
	StatsEmptyActionSocial,
} from 'calypso/my-sites/stats/features/modules/shared';
import StatsCardSkeleton from 'calypso/my-sites/stats/features/modules/shared/stats-card-skeleton';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import ErrorPanel from 'calypso/my-sites/stats/stats-error';
import StatsListCard from 'calypso/my-sites/stats/stats-list/stats-list-card';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { useSharingButtonsQuery } from 'calypso/sites/marketing/sharing/use-sharing-buttons-query';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsForQuery,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import type {
	StatsStateProps,
	StatsPeriodGrainType,
} from 'calypso/my-sites/stats/features/modules/types';

type StatSharesProps = {
	siteId: number;
	className?: string;
};

type StatSharePlaformData = {
	ID: string;
	custom: boolean;
	enabled: boolean;
	genericon: string;
	name: string;
	shortname: string;
	visibility: string;
};

type StatShareData = {
	date: string;
	stats: Record< string, unknown >;
	visits: {
		data: Record< string, unknown >;
		date: string;
		fields: string[];
		unit: StatsPeriodGrainType;
	};
};

type StatShareDataDisplayItem = {
	id: string;
	value: number;
	label: string;
};

const StatShares: React.FC< StatSharesProps > = ( { siteId, className } ) => {
	const translate = useTranslate();
	const isLoading = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'stats', {} )
	);
	const { data: shareButtons } = useSharingButtonsQuery( siteId );
	const hasError = useSelector( ( state: StatsStateProps ) =>
		hasSiteStatsQueryFailed( state, siteId, 'stats', {} )
	);
	const siteStats: StatShareData | null = useSelector( ( state: StatsStateProps ) =>
		getSiteStatsForQuery( state, siteId, 'stats', {} )
	) as StatShareData | null;

	const data: StatShareDataDisplayItem[] = [];

	if ( siteStats && shareButtons ) {
		shareButtons.forEach( ( service: StatSharePlaformData ) => {
			const value = siteStats?.stats?.[ 'shares_' + service.ID ] as number;

			if ( value ) {
				data.push( {
					id: service.ID,
					value,
					label: service.name,
				} );
			}
		} );

		// sort descending
		data.sort( ( a, b ) => b.value - a.value );
	}

	const title = translate( 'Number of Shares' );
	const isEmptyStateV2 = config.isEnabled( 'stats/empty-module-v2' );

	return (
		<>
			{ siteId && <QuerySiteStats siteId={ siteId } statType="stats" /> }
			{ isEmptyStateV2 && isLoading && (
				<StatsCardSkeleton
					isLoading={ isLoading }
					className={ className }
					title={ title }
					type={ 3 }
				/>
			) }
			{
				// old module
				( ( ! isLoading && !! data?.length ) || ! isEmptyStateV2 ) && (
					// @ts-expect-error TODO: Refactor StatsListCard with TypeScript.
					<StatsListCard
						className={ className }
						moduleType="shares"
						data={ data }
						title={ title }
						emptyMessage={ translate( 'No shares recorded' ) }
						mainItemLabel=""
						metricLabel=""
						splitHeader
						useShortNumber
						// Shares module doen't have a summary page.
						error={
							( hasError || ( ! isLoading && ! siteStats?.stats?.shares ) ) && (
								<ErrorPanel message={ translate( 'No shares recorded' ) } />
							)
						}
						loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
						titleNodes={
							isEmptyStateV2 && (
								<StatsInfoArea>
									{ translate( 'Learn where your content has been shared the most.' ) }
								</StatsInfoArea>
							)
						}
					/>
				)
			}
			{ isEmptyStateV2 && ! isLoading && ! data?.length && (
				// show empty state
				<StatsCard
					className={ clsx( 'stats-card--empty-variant', className ) }
					title={ title }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ share }
							description={ translate(
								'Learn where your content has been shared the most. Start creating and sharing!'
							) }
							cards={
								<>
									<StatsEmptyActionAI from="module_total_shares" />
									<StatsEmptyActionSocial from="module_total_shares" />
								</>
							}
						/>
					}
				/>
			) }
		</>
	);
};

export default StatShares;
