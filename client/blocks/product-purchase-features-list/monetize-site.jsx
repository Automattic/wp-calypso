import { localize } from 'i18n-calypso';
import wordAdsImage from 'calypso/assets/images/illustrations/dotcom-wordads.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { selectedSite, translate } ) => {
	const isAtomic = selectedSite?.is_wpcom_atomic ?? false;
	const isJetpack = selectedSite?.jetpack ?? false;
	const adSettingsUrl =
		! isJetpack || isAtomic
			? '/earn/ads-earnings/' + selectedSite.slug
			: '/marketing/traffic/' + selectedSite.slug;
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
