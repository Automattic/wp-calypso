import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import paymentsImage from 'calypso/assets/images/illustrations/payments.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';

export default localize( ( { isJetpack, translate } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				buttonText={ translate( 'Collect PayPal payments' ) }
				description={ translate(
					'Add a button to any post or page to collect PayPal payments for physical products, services, or donations.'
				) }
				{ ...( isJetpack
					? {
							href: localizeUrl( 'https://jetpack.com/support/pay-with-paypal/' ),
							target: '_blank',
					  }
					: { supportContext: 'sell-online-paypal' } ) }
				icon={ <img alt="" src={ paymentsImage } /> }
				title={ translate( 'Sell online with PayPal' ) }
			/>
		</div>
	);
} );
