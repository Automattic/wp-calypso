import { activeAgencyQuery } from '@automattic/api-queries';
import { formatNumber, formatNumberCompact } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { isRouteAllowedByCapabilities, marketplaceHostingRoute } from '../../../app/router/agency';
import OverviewCard from '../../../components/overview-card';
import { Stat } from '../../../components/stat';
import PlanCard from '../../../sites/overview-plan-card';
import { calculateEffectiveCapacity } from '../../marketplace/hosting/lib/pressable-capacity';
import { getPressablePlanInfo } from '../../marketplace/hosting/lib/pressable-plans';
import { getMarketplaceHostingSectionRoute } from '../../marketplace/paths';
import { useAgencyPressablePlan } from '../../marketplace/use-agency-pressable-plan';
import { isPressableSite } from '../lib';
import type { PressableCapacity } from '../../marketplace/hosting/lib/pressable-capacity';
import type { AgencyProduct, AgencySite, Site } from '@automattic/api-core';

const USAGE_WARNING_THRESHOLD = 80;

const percentage = ( value: number, total: number ) =>
	total > 0 ? Math.min( 100, Math.round( ( value / total ) * 100 ) ) : 0;

// The plan and usage belong to the agency's Pressable account, which every one
// of its Pressable sites shares. Pressable does not report usage per site.
function PressablePlanCard( {
	plan,
	capacity,
}: {
	plan: AgencyProduct;
	capacity: PressableCapacity;
} ) {
	const { data: agency } = useQuery( activeAgencyQuery() );

	// A new plan has no usage until Pressable reports it, usually the next day.
	const usage = agency?.third_party?.pressable?.usage ?? undefined;
	const sitesUsed = usage?.sites_count ?? 0;
	const visitsUsed = usage?.visits_count ?? 0;
	const storageUsed = usage?.storage_gb ?? 0;
	const visitsPercent = percentage( visitsUsed, capacity.visits );
	const storagePercent = percentage( storageUsed, capacity.storage );

	const canViewMarketplace = isRouteAllowedByCapabilities(
		marketplaceHostingRoute,
		agency?.user?.capabilities ?? []
	);

	return (
		<OverviewCard
			title={ __( 'Plan' ) }
			icon={ <img src={ pressableIcon } alt="" width={ 24 } /> }
			heading={ plan.name }
			description={ sprintf(
				/* translators: %d is the number of sites on the agency's Pressable plan. */
				_n(
					'Storage and visits are shared across %d site in your plan.',
					'Storage and visits are shared across %d sites in your plan.',
					sitesUsed
				),
				sitesUsed
			) }
			link={ canViewMarketplace ? getMarketplaceHostingSectionRoute( 'pressable' ) : undefined }
			tracksId="site-overview-plan"
			bottom={
				<VStack spacing={ 4 }>
					<Stat
						density="high"
						isLoading={ ! usage }
						strapline={ __( 'Sites' ) }
						metric={ formatNumber( sitesUsed ) }
						description={ sprintf(
							/* translators: %s is the maximum number of sites. */
							__( 'of %s' ),
							formatNumber( capacity.install )
						) }
						progressValue={ percentage( sitesUsed, capacity.install ) }
					/>
					<Stat
						density="high"
						isLoading={ ! usage }
						strapline={ __( 'Visits this month' ) }
						metric={ formatNumberCompact( visitsUsed ) }
						description={ sprintf(
							/* translators: %s is the maximum number of monthly visits. */
							__( 'of %s' ),
							formatNumberCompact( capacity.visits )
						) }
						progressValue={ visitsPercent }
						progressColor={ visitsPercent > USAGE_WARNING_THRESHOLD ? 'alert-yellow' : undefined }
					/>
					<Stat
						density="high"
						isLoading={ ! usage }
						strapline={ __( 'Storage' ) }
						metric={ sprintf(
							/* translators: %s is the storage used in GB. */
							__( '%sGB' ),
							formatNumber( storageUsed )
						) }
						description={ sprintf(
							/* translators: %s is the storage limit in GB. */
							__( 'of %sGB' ),
							formatNumber( capacity.storage )
						) }
						progressValue={ storagePercent }
						progressColor={ storagePercent > USAGE_WARNING_THRESHOLD ? 'alert-yellow' : undefined }
					/>
				</VStack>
			}
		/>
	);
}

// Without a Pressable plan bought through A4A there is no plan to show, so the
// site falls back to the Jetpack card.
function PressableSitePlanCard( { site }: { site: Site } ) {
	const { plan, licenses, products } = useAgencyPressablePlan();
	const planInfo = plan && getPressablePlanInfo( plan );

	if ( ! plan || ! planInfo ) {
		return <PlanCard site={ site } />;
	}

	return (
		<PressablePlanCard
			plan={ plan }
			capacity={ calculateEffectiveCapacity( planInfo, licenses, products ) }
		/>
	);
}

export default function AgencySitePlanCard( {
	agencySite,
	site,
}: {
	agencySite: AgencySite | null;
	site: Site;
} ) {
	if ( isPressableSite( agencySite ) ) {
		return <PressableSitePlanCard site={ site } />;
	}

	return <PlanCard site={ site } />;
}
