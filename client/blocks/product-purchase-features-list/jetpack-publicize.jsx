import { localize } from 'i18n-calypso';
import marketingImage from 'calypso/assets/images/illustrations/marketing.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { selectedSite, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ marketingImage } /> }
				title={ translate( 'Marketing Automation' ) }
				description={ translate(
					'Schedule unlimited tweets, Facebook posts, and other social posts in advance.'
				) }
				buttonText={ translate( 'Learn more' ) }
				href={ `/marketing/connections/${ selectedSite.slug }` }
			/>
		</div>
	);
} );
