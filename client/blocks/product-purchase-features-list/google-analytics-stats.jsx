import { localize } from 'i18n-calypso';
import googleAnalyticsImage from 'calypso/assets/images/illustrations/google-analytics.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ googleAnalyticsImage } /> }
				title={ translate( 'Google Analytics' ) }
				description={ translate(
					"Complement WordPress.com's stats with Google's in-depth look at your visitors and traffic patterns."
				) }
				buttonText={ translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug }
			/>
		</div>
	);
} );
