import { localize } from 'i18n-calypso';
import googleMyBusinessImage from 'calypso/assets/images/illustrations/google-my-business-feature.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ googleMyBusinessImage } /> }
				title={ translate( 'Google My Business' ) }
				description={ translate(
					'Create a Google business listing, connect with customers, and discover how customers find you on Google by connecting to a Google My Business location.'
				) }
				buttonText={ translate( 'Connect to Google My Business' ) }
				href={ '/google-my-business/' + selectedSite.slug }
			/>
		</div>
	);
} );
