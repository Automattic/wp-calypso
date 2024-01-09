import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';

type Props = {
	product: APIProductFamilyProduct;
	quantity?: number;
};

const LicenseLightboxManageLicense: FunctionComponent< Props > = ( { product, quantity } ) => {
	const translate = useTranslate();

	return (
		<div className="license-lightbox__manage-license">
			<h3 className="license-lightbox__manage-license-title">
				{ translate( 'Jetpack Manage License:' ) }
			</h3>

			<div className="license-lightbox__pricing">
				<ProductPriceWithDiscount product={ product } quantity={ quantity } />
			</div>
		</div>
	);
};

export default LicenseLightboxManageLicense;
