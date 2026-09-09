import { siteCurrentPlanQuery, sitePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { payment } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { getSitePlanDisplayName } from '../../utils/site-plan';
import { getSitePlanUrl } from '../../utils/site-url';
import { isRelativeUrl } from '../../utils/url';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SettingsPlanSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { data: plan, isLoading: isLoadingPlan } = useQuery( siteCurrentPlanQuery( site.ID ) );
	const { data: purchase, isLoading: isLoadingPurchase } = useQuery( {
		...sitePurchasesQuery( site.ID ),
		select: ( data ) => data.find( ( purchase ) => purchase.ID === plan?.id ),
		enabled: !! plan?.id,
	} );

	const { supports } = useAppContext();

	const url = getSitePlanUrl( site, purchase );
	if ( ! url || ! isRelativeUrl( url ) ) {
		return null;
	}

	// The purchase-management URL only resolves in dashboards that register the
	// `/me/billing` routes.
	if ( url.startsWith( '/me/billing/' ) && ! ( supports.me && supports.me.billing ) ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ url }
			title={ __( 'Manage plan' ) }
			density={ density }
			decoration={ <Icon icon={ payment } /> }
			disabled={ isLoadingPlan || isLoadingPurchase }
			badges={ [
				{
					text: getSitePlanDisplayName( site ),
				},
			] }
		/>
	);
}
