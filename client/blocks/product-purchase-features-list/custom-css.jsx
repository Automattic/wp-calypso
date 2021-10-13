import { useTranslate } from 'i18n-calypso';
import customizeImage from 'calypso/assets/images/illustrations/dashboard.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

function getEditCSSLink( selectedSite ) {
	return '/customize/custom-css/' + selectedSite.slug;
}

export default function CustomCSS( { selectedSite } ) {
	const translate = useTranslate();
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ customizeImage } /> }
				title={ translate( 'Custom CSS' ) }
				description={ translate(
					'Enjoy more control over your site’s look and feel by writing your own CSS.'
				) }
				buttonText={ translate( 'Edit CSS' ) }
				href={ getEditCSSLink( selectedSite ) }
			/>
		</div>
	);
}
