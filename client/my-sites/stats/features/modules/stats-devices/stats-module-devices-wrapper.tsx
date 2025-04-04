import clsx from 'clsx';
import { STATS_TYPE_DEVICE_STATS } from 'calypso/my-sites/stats/constants';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import { default as usePlanUsageQuery } from '../../../hooks/use-plan-usage-query';
import useStatsPurchases from '../../../hooks/use-stats-purchases';
import statsStrings from '../../../stats-strings';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import StatsModuleDevices from './stats-module-devices';
import StatsModuleUpgradeOverlay from './stats-module-upgrade-overlay';
import type { StatsAdvancedModuleWrapperProps } from '../types';

const DEVICES_CLASS_NAME = 'stats-module-devices';

const StatsModuleDevicesWrapper: React.FC< StatsAdvancedModuleWrapperProps > = ( {
	siteId,
	period,
	postId,
	query,
	className,
} ) => {
	const { devices: devicesStrings } = statsStrings();
	const shouldGateStats = useShouldGateStats( STATS_TYPE_DEVICE_STATS );

	// Check if blog is internal.
	const { isPending: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck } = useStatsPurchases( siteId );

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck; // This is not fetching Devices data.

	const isAdvancedFeatureEnabled = isSiteInternal || ! shouldGateStats;

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	return (
		<>
			{ isFetching && (
				<StatsCardSkeleton
					isLoading={ isFetching }
					className={ className }
					title={ devicesStrings?.title }
					type={ 1 }
				/>
			) }
			{ ! isFetching && ! isAdvancedFeatureEnabled && (
				<StatsModuleUpgradeOverlay className={ className } siteId={ siteId } />
			) }
			{ ! isFetching && isAdvancedFeatureEnabled && (
				<StatsModuleDevices
					path="devices"
					className={ clsx( className, DEVICES_CLASS_NAME ) }
					period={ period }
					query={ query }
					isLoading={ isFetching }
					postId={ postId }
				/>
			) }
		</>
	);
};

export default StatsModuleDevicesWrapper;
