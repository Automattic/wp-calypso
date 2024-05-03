import { StatsCard } from '@automattic/components';
import classNames from 'classnames';
import { STATS_FEATURE_UTM_STATS } from '../constants';
import { default as usePlanUsageQuery } from '../hooks/use-plan-usage-query';
import { useShouldGateStats } from '../hooks/use-should-gate-stats';
import useStatsPurchases from '../hooks/use-stats-purchases';
import StatsModulePlaceholder from '../stats-module/placeholder';
import statsStrings from '../stats-strings';
import StatsModuleUTM from './stats-module-utm';
import StatsModuleUTMOverlay from './stats-module-utm-overlay';

const StatsModuleUTMWrapper = ( { siteId, period, postId, query, summary, className } ) => {
	const moduleStrings = statsStrings();

	// Check if blog is internal.
	const { isPending: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	// Check if the UTM stats module is supported by standalone Stats purchases.
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );
	// Check if the UTM stats module should be gated by WPCOM plans.
	const { isGatedStats: isGatedUTMStats } = useShouldGateStats( STATS_FEATURE_UTM_STATS );

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck;
	const isAdvancedFeatureEnabled = isSiteInternal || supportCommercialUse || ! isGatedUTMStats;

	// TODO: trigger useUTMMetricsQuery manually once isAdvancedFeatureEnabled === true

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	const hideSummaryLink = postId !== undefined || summary === true;

	return (
		<>
			{ isFetching && (
				<StatsCard
					title="UTM"
					className={ classNames( className, 'stats-module-utm', 'stats-module__card', 'utm' ) }
					isNew
				>
					<StatsModulePlaceholder isLoading />
				</StatsCard>
			) }
			{ ! isFetching && ! isAdvancedFeatureEnabled && (
				<StatsModuleUTMOverlay className={ className } siteId={ siteId } />
			) }
			{ ! isFetching && isAdvancedFeatureEnabled && (
				<StatsModuleUTM
					path="utm"
					className={ classNames( className, 'stats-module-utm' ) }
					moduleStrings={ moduleStrings.utm }
					period={ period }
					query={ query }
					isLoading={ isFetching ?? true }
					hideSummaryLink={ hideSummaryLink }
					postId={ postId }
				/>
			) }
		</>
	);
};

export { StatsModuleUTMWrapper as default };
