import { siteCurrentPlanQuery, sitePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { payment } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { getSitePlanDisplayName, useSitePlanManageURL } from '../../utils/site-plan';
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

	const url = useSitePlanManageURL( site, purchase );
	if ( ! url || ! isRelativeUrl( url ) ) {
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
