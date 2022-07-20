import { localize } from 'i18n-calypso';
import adsRemovedImage from 'calypso/assets/images/illustrations/removed-ads.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { isEligiblePlan, selectedSite, translate } ) => {
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
						: translate(
								'All WordPress.com advertising has been removed from your site. Upgrade to Pro ' +
									'to remove the WordPress.com footer credit.'
						  )
				}
				buttonText={ ! isEligiblePlan ? translate( 'Upgrade to Pro' ) : null }
				href={ ! isEligiblePlan ? '/checkout/' + selectedSite.slug + '/pro' : null }
			/>
		</div>
	);
} );
