import { localize } from 'i18n-calypso';
import premiumThemesImage from 'calypso/assets/images/illustrations/themes.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ premiumThemesImage } /> }
				title={ translate( 'Try a premium theme' ) }
				description={ translate(
					'Access a diverse selection of beautifully designed premium themes included with your plan.'
				) }
				buttonText={ translate( 'Browse premium themes' ) }
				href={ '/themes/' + selectedSite.slug }
			/>
		</div>
	);
} );
