import { localize } from 'i18n-calypso';
import wordAdsImage from 'calypso/assets/images/illustrations/dotcom-wordads.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { selectedSite, translate } ) => {
	const adSettingsUrl = selectedSite.jetpack
		? '/marketing/traffic/' + selectedSite.slug
		: '/earn/ads-settings/' + selectedSite.slug;
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ wordAdsImage } /> }
				title={ translate( 'Monetize your site with ads' ) }
				description={ translate(
					'WordAds lets you earn money by displaying promotional content. Start earning today. '
				) }
				buttonText={ translate( 'Start earning' ) }
				href={ adSettingsUrl }
			/>
		</div>
	);
} );
