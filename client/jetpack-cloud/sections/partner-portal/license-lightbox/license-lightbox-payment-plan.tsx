import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';

type Props = {
	product: APIProductFamilyProduct;
};

const LicenseLightboxPaymentPlan: FunctionComponent< Props > = ( { product } ) => {
	const translate = useTranslate();

	return (
		<div className="license-lightbox__payment-plan">
			<h3 className="license-lightbox__payment-plan-title">{ translate( 'Payment plan:' ) }</h3>

			<div className="license-lightbox__pricing">
				<ProductPriceWithDiscount product={ product } />
			</div>
		</div>
	);
};

export default LicenseLightboxPaymentPlan;
