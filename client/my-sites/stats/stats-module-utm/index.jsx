import { StatsCard } from '@automattic/components';
import clsx from 'clsx';
import { default as usePlanUsageQuery } from '../hooks/use-plan-usage-query';
import useStatsPurchases from '../hooks/use-stats-purchases';
import StatsModulePlaceholder from '../stats-module/placeholder';
import statsStrings from '../stats-strings';
import StatsModuleUTM from './stats-module-utm';
import StatsModuleUTMOverlay from './stats-module-utm-overlay';

const StatsModuleUTMWrapper = ( { siteId, period, postId, query, summary, className } ) => {
	const moduleStrings = statsStrings();

	// Check if blog is internal.
	const { isPending: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck;
	const isAdvancedFeatureEnabled = isSiteInternal || supportCommercialUse;

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
				<StatsModuleUTM
					path="utm"
					className={ clsx( className, 'stats-module-utm' ) }
					moduleStrings={ moduleStrings.utm }
					period={ period }
					query={ query }
					isLoading={ isFetching ?? true }
					hideSummaryLink={ hideSummaryLink }
					postId={ postId }
					summary={ summary }
				/>
			) }
		</>
	);
};

export { StatsModuleUTMWrapper as default };
