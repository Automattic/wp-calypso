import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, _x } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { useAppContext } from '../../../app/context';
import { movePurchaseRoute } from '../../../app/router/me';
import { ActionList } from '../../../components/action-list';
import { canManageSite } from '../../../sites/features';
import { isDotcomPlan } from '../../../utils/purchase';
import {
	canSiteReceivePurchase,
	isPurchaseMovableToAnotherSite,
	useIsPurchaseSiteTransferEnabled,
} from './eligibility';
import type { Purchase } from '@automattic/api-core';

/**
 * Offers to move the purchase to another of the owner's sites. Shown only when
 * at least one of their other sites could receive it.
 */
export function MovePurchaseActionItem( { purchase }: { purchase: Purchase } ) {
	const isEnabled = useIsPurchaseSiteTransferEnabled();
	const { user } = useAuth();
	const { queries } = useAppContext();
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	const isEligible =
		isEnabled &&
		String( user.ID ) === String( purchase.user_id ) &&
		isPurchaseMovableToAnotherSite( purchase );

	const { data: sites = [] } = useQuery( { ...queries.sitesQuery(), enabled: isEligible } );
	const hasTargetSite = sites.some(
		( site ) => canManageSite( site ) && canSiteReceivePurchase( purchase, site )
	);

	if ( ! isEligible || ! hasTargetSite ) {
		return null;
	}

	return (
		<ActionList.ActionItem
			title={
				// translators: Moving a subscription, such as a plan or domain, to a different site.
				_x( 'Move to another site', 'subscription site transfer' )
			}
			description={
				isDotcomPlan( purchase )
					? __( 'Bought this plan for the wrong site? Move it, and its domain, to another site.' )
					: __( 'Bought this domain for the wrong site? Move it, and its email, to another site.' )
			}
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						recordTracksEvent( 'calypso_purchases_site_transfer_click', {
							product_slug: purchase.product_slug,
						} );
						navigate( {
							to: movePurchaseRoute.fullPath,
							params: { purchaseId: purchase.ID },
						} );
					} }
				>
					{
						// translators: Button that opens the screen for moving a subscription, such as a plan or domain, to another site.
						_x( 'Move', 'subscription site transfer' )
					}
				</Button>
			}
		/>
	);
}
