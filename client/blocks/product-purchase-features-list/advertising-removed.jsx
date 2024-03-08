import { getPlan } from '@automattic/calypso-products';
import { PLAN_BUSINESS } from '@automattic/data-stores/src/plans/constants';
import { localize } from 'i18n-calypso';
import adsRemovedImage from 'calypso/assets/images/illustrations/removed-ads.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { isEligiblePlan, selectedSite, translate } ) => {
	const businessPlanName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';
	const uneligiblePlanDescription = translate(
		'All WordPress.com advertising has been removed from your site. Upgrade to %(businessPlanName)s ' +
			'to remove the WordPress.com footer credit.',
		{
			args: { businessPlanName },
		}
	);
	const buttonText = translate( 'Upgrade to %(planName)s', {
		args: { planName: businessPlanName },
	} );
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ adsRemovedImage } /> }
				title={ translate( 'Advertising removed' ) }
				description={
					isEligiblePlan
						? translate(
								'All WordPress.com advertising has been removed from your site so your brand can stand out without distractions.'
						  )
						: uneligiblePlanDescription
				}
				buttonText={ ! isEligiblePlan ? buttonText : null }
				href={ ! isEligiblePlan ? '/checkout/' + selectedSite.slug + '/business' : null }
			/>
		</div>
	);
} );
