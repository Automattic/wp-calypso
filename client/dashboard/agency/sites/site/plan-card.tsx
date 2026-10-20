import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { isRouteAllowedByCapabilities, marketplaceHostingRoute } from '../../../app/router/agency';
import OverviewCard from '../../../components/overview-card';
import PlanCard from '../../../sites/overview-plan-card';
import { calculateEffectiveCapacity } from '../../marketplace/hosting/lib/pressable-capacity';
import { getPressablePlanInfo } from '../../marketplace/hosting/lib/pressable-plans';
import PressableUsageStats from '../../marketplace/hosting/pressable-usage-stats';
import { getMarketplaceHostingSectionRoute } from '../../marketplace/paths';
import { useAgencyPressablePlan } from '../../marketplace/use-agency-pressable-plan';
import { isPressableSite } from '../lib';
import type { PressableCapacity } from '../../marketplace/hosting/lib/pressable-capacity';
import type { AgencyProduct, AgencySite, Site } from '@automattic/api-core';

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

	const canViewMarketplace = isRouteAllowedByCapabilities(
		marketplaceHostingRoute,
		agency?.user?.capabilities ?? []
	);

	return (
		<OverviewCard
			title={ __( 'Plan' ) }
			icon={ <img src={ pressableIcon } alt="" width={ 24 } /> }
			heading={ plan.name }
			description={
				usage
					? sprintf(
							/* translators: %d is the number of sites on the agency's Pressable plan. */
							_n(
								'Storage and visits are shared across %d site in your plan.',
								'Storage and visits are shared across %d sites in your plan.',
								usage.sites_count ?? 0
							),
							usage.sites_count ?? 0
						)
					: __( 'Storage and visits are shared across the sites in your plan.' )
			}
			link={ canViewMarketplace ? getMarketplaceHostingSectionRoute( 'pressable' ) : undefined }
			tracksId="site-overview-plan"
			bottom={ <PressableUsageStats usage={ usage } capacity={ capacity } /> }
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
