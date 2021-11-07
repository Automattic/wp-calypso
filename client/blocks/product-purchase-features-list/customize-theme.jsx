import { localize } from 'i18n-calypso';
import customizeImage from 'calypso/assets/images/illustrations/dashboard.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

function getCustomizeLink( selectedSite ) {
	return '/customize/' + selectedSite.slug;
}

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ customizeImage } /> }
				title={ translate( 'Advanced customization' ) }
				description={ translate(
					"Change your site's appearance in a few clicks, with an expanded " +
						'selection of fonts and colors.'
				) }
				buttonText={ translate( 'Start customizing' ) }
				href={ getCustomizeLink( selectedSite ) }
			/>
		</div>
	);
} );
