import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

type Props = {
	product: APIProductFamilyProduct;
};

const LicenseProductLightboxPaymentPlan: FunctionComponent< Props > = ( { product } ) => {
	const translate = useTranslate();
	return (
		<div className="license-product-lightbox__payment-plan">
			<h3 className="license-product-lightbox__payment-plan-title">
				{ translate( 'Payment plan:' ) }
			</h3>

			<div className="license-product-lightbox__pricing">
				<span className="license-product-lightbox__pricing-amount">
					{ formatCurrency( product.amount, product.currency ) }
				</span>
				<span className="license-product-lightbox__pricing-interval">
					{ product.price_interval === 'day' && translate( '/USD per license per day' ) }
					{ product.price_interval === 'month' && translate( '/USD per license per month' ) }
				</span>
			</div>
		</div>
	);
};

export default LicenseProductLightboxPaymentPlan;
