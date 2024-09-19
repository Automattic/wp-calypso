import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';

type Props = {
	product: APIProductFamilyProduct;
	quantity?: number;
};

const LicenseLightboxJetpackManageLicense: FunctionComponent< Props > = ( {
	product,
	quantity,
} ) => {
	const translate = useTranslate();

	// Once this component is ported to A4A, we can get remove this conditional
	const isA4A = isA8CForAgencies();

	return (
		<div className="license-lightbox__jetpack-manage-license">
			<h3 className="license-lightbox__jetpack-manage-license-title">
				{ ! isA4A && translate( 'Jetpack Manage license:' ) }
			</h3>

			<div className="license-lightbox__pricing">
				<ProductPriceWithDiscount product={ product } quantity={ quantity } />
			</div>
		</div>
	);
};

export default LicenseLightboxJetpackManageLicense;
