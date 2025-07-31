import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { cloneElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import filesize from 'filesize';
import { siteMediaStorageQuery } from '../../app/queries/site-media-storage';
import { siteMetricsQuery } from '../../app/queries/site-metrics';
import { siteCurrentPlanQuery } from '../../app/queries/site-plans';
import { sitePurchaseQuery } from '../../app/queries/site-purchases';
import { Stat } from '../../components/stat';
import { DotcomPlans } from '../../data/constants';
import { getSiteDisplayUrl } from '../../utils/site-url';
import OverviewCard from '../overview-card';
import type { Site, Plan, Purchase } from '../../data/types';

const MINIMUM_DISPLAYED_USAGE = 2.5;
const ALERT_PERCENT = 80;

function getCurrentMonthRangeTimestamps() {
	const now = new Date();
	const firstDayOfMonth = new Date( now.getFullYear(), now.getMonth(), 1 );
	const startInSeconds = Math.floor( firstDayOfMonth.getTime() / 1000 );

	const today = new Date();
	today.setMinutes( 59 );
	today.setSeconds( 59 );
	const endInSeconds = Math.floor( today.getTime() / 1000 );

	return {
		startInSeconds,
		endInSeconds,
	};
}

export default function PlanCard( { site }: { site: Site } ) {
	const { data: plan, isLoading: isLoadingPlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: purchase, isLoading: isLoadingPurchase } = useQuery( {
		...sitePurchaseQuery( site.ID, plan?.id ?? '' ),
		enabled: !! plan?.id,
	} );
	const { data: mediaStorage, isLoading: isLoadingMediaStorage } = useQuery(
		siteMediaStorageQuery( site.ID )
	);
	const { startInSeconds, endInSeconds } = getCurrentMonthRangeTimestamps();
	const { data: bandwidth, isLoading: isLoadingBandwidth } = useQuery( {
		...siteMetricsQuery( site.ID, {
			start: startInSeconds,
			end: endInSeconds,
			metric: 'response_bytes_persec',
		} ),
		enabled: !! site.is_wpcom_atomic,
		select: ( data ) => {
			if ( ! data ) {
				return data;
			}
			const domain = getSiteDisplayUrl( site );
			return data.data.periods.reduce(
				( acc, curr ) => acc + ( curr.dimension[ domain ] || 0 ),
				0
			);
		},

		// Don't update until page is refreshed
		meta: { persist: false },
		staleTime: Infinity,
	} );

	const storageUsagePercent = ! mediaStorage
		? 0
		: Math.round(
				( ( mediaStorage.storage_used_bytes / mediaStorage.max_storage_bytes ) * 1000 ) / 10
		  );

	// Ensure that the displayed usage is never fully empty to avoid a confusing UI.
	const progressBarValue = Math.max(
		MINIMUM_DISPLAYED_USAGE,
		Math.min( storageUsagePercent, 100 )
	);

	let storageWarningColor = undefined;
	if ( storageUsagePercent > 100 ) {
		storageWarningColor = 'alert-red' as const;
	} else if ( storageUsagePercent > ALERT_PERCENT ) {
		storageWarningColor = 'alert-yellow' as const;
	}

	const icon = cloneElement( wordpress, {
		style: { color: 'var( --wp-admin-brand-color )' },
	} );

	return (
		<OverviewCard
			title={ __( 'Plan' ) }
			icon={ icon }
			heading={ site.plan?.product_name_short }
			description={ getCardDescription( plan, purchase ) }
			tracksId="plan"
			isLoading={
				isLoadingPlan || isLoadingPurchase || isLoadingMediaStorage || isLoadingBandwidth
			}
			link={ site.plan?.is_free ? undefined : '/v2/me/billing/active-subscriptions' }
			bottom={
				<VStack spacing={ 4 }>
					<Stat
						density="high"
						strapline={ __( 'Storage' ) }
						metric={ mediaStorage && filesize( mediaStorage.storage_used_bytes, { round: 0 } ) }
						description={ mediaStorage && filesize( mediaStorage.max_storage_bytes, { round: 0 } ) }
						progressValue={ progressBarValue }
						progressColor={ storageWarningColor }
						progressLabel={ `${ storageUsagePercent }%` }
						isLoading={ isLoadingMediaStorage }
					/>
					<Stat
						density="high"
						strapline={ __( 'Bandwidth' ) }
						metric={
							bandwidth && site.is_wpcom_atomic
								? filesize( bandwidth, { round: 1 } )
								: __( 'Unlimited' )
						}
						description={ site.is_wpcom_atomic ? __( 'Unlimited' ) : undefined }
						progressValue={ 100 }
						progressColor="alert-green"
						isLoading={ isLoadingBandwidth }
					/>
				</VStack>
			}
		/>
	);
}

function getCardDescription( plan?: Plan, purchase?: Purchase ) {
	if ( plan?.product_slug === DotcomPlans.FREE_PLAN ) {
		return __( 'Upgrade to access all hosting features.' );
	}

	return purchase?.expiry_message;
}
