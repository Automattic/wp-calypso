import { useQuery } from '@tanstack/react-query';
import { cloneElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { siteCurrentPlanQuery } from '../../app/queries/site-plans';
import { sitePurchaseQuery } from '../../app/queries/site-purchases';
import { DotcomPlans } from '../../data/constants';
import OverviewCard from '../overview-card';
import type { Site, Plan, Purchase } from '../../data/types';

export default function PlanCard( { site }: { site: Site } ) {
	const { data: plan, isLoading: isLoadingPlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: purchase, isLoading: isLoadingPurchase } = useQuery( {
		...sitePurchaseQuery( site.ID, plan?.id ?? '' ),
		enabled: !! plan?.id,
	} );

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
			isLoading={ isLoadingPlan || isLoadingPurchase }
			link={ site.plan?.is_free ? undefined : '/v2/me/billing/active-subscriptions' }
			bottom={ <div /> }
		/>
	);
}

function getCardDescription( plan?: Plan, purchase?: Purchase ) {
	if ( plan?.product_slug === DotcomPlans.FREE_PLAN ) {
		return __( 'Upgrade to access all hosting features.' );
	}

	return purchase?.expiry_message;
}
