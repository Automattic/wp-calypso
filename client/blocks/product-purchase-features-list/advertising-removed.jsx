import { getPlan } from '@automattic/calypso-products';
import { PLAN_BUSINESS } from '@automattic/data-stores/src/plans/constants';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import i18n, { localize } from 'i18n-calypso';
import adsRemovedImage from 'calypso/assets/images/illustrations/removed-ads.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { isEligiblePlan, selectedSite, translate } ) => {
	const isEnglishLocale = useIsEnglishLocale();
	const uneligiblePlanDescription =
		isEnglishLocale ||
		i18n.hasTranslation(
			'All WordPress.com advertising has been removed from your site. Upgrade to %(businessPlanName)s ' +
				'to remove the WordPress.com footer credit.'
		)
			? translate(
					'All WordPress.com advertising has been removed from your site. Upgrade to %(businessPlanName)s ' +
						'to remove the WordPress.com footer credit.',
					{
						args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() },
					}
			  )
			: translate(
					'All WordPress.com advertising has been removed from your site. Upgrade to Business ' +
						'to remove the WordPress.com footer credit.'
			  );
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
				buttonText={ ! isEligiblePlan ? translate( 'Upgrade to Business' ) : null }
				href={ ! isEligiblePlan ? '/checkout/' + selectedSite.slug + '/business' : null }
			/>
		</div>
	);
} );
