import config from '@automattic/calypso-config';
import { StatsCard } from '@automattic/components';
import clsx from 'clsx';
import React from 'react';
import { STATS_FEATURE_UTM_STATS } from 'calypso/my-sites/stats/constants';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { default as usePlanUsageQuery } from '../../../hooks/use-plan-usage-query';
import useStatsPurchases from '../../../hooks/use-stats-purchases';
import StatsModulePlaceholder from '../../../stats-module/placeholder';
import statsStrings from '../../../stats-strings';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import StatsModuleUTM from './stats-module-utm';
import StatsModuleUTMOverlay from './stats-module-utm-overlay';
import type { StatsAdvancedModuleWrapperProps } from '../types';

const StatsModuleUTMWrapper: React.FC< StatsAdvancedModuleWrapperProps > = ( {
	siteId,
	period,
	postId,
	query,
	summary,
	className,
} ) => {
	const isNewEmptyStateEnabled = config.isEnabled( 'stats/empty-module-traffic' );
	const isGatedByShouldGateStats = config.isEnabled( 'stats/restricted-dashboard' );
	const moduleStrings = statsStrings();
	const shouldGateStats = useShouldGateStats( STATS_FEATURE_UTM_STATS );

	// Check if blog is internal.
	const { isPending: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck; // This is not fetching UTM data.

	const isAdvancedFeatureEnabled =
		isSiteInternal || ( isGatedByShouldGateStats ? ! shouldGateStats : supportCommercialUse );

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	const hideSummaryLink = postId !== undefined || summary === true;

	return (
		<>
			{ isFetching && isNewEmptyStateEnabled && (
				<StatsCardSkeleton
					isLoading={ isFetching }
					className={ className }
					title={ moduleStrings?.utm?.title }
					type={ 3 }
				/>
			) }
			{ isFetching && ! isNewEmptyStateEnabled && (
				<StatsCard
					title="UTM"
					className={ clsx( className, 'stats-module-utm', 'stats-module__card', 'utm' ) }
					isNew
				>
					<StatsModulePlaceholder isLoading />
				</StatsCard>
			) }
			{ ! isFetching && ! isAdvancedFeatureEnabled && (
				<StatsModuleUTMOverlay className={ className } siteId={ siteId } />
			) }
			{ ! isFetching && isAdvancedFeatureEnabled && (
				// @ts-expect-error TODO: Refactor StatsModuleUTM with TypeScript.
				<StatsModuleUTM
					path="utm"
					className={ clsx( className, 'stats-module-utm' ) }
					moduleStrings={ moduleStrings.utm }
					period={ period }
					query={ query }
					isLoading={ isFetching ?? true } // remove this line when cleaning 'stats/empty-module-traffic' - isFetching will never be true here and loaders are handled inside
					hideSummaryLink={ hideSummaryLink }
					postId={ postId }
					summary={ summary }
				/>
			) }
		</>
	);
};

export { StatsModuleUTMWrapper as default };
