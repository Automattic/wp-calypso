import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import ProductPriceWithDiscountA4A from 'calypso/a8c-for-agencies/sections/marketplace/products-overview/product-card/product-price-with-discount-info';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';
import type { TermPricingType } from 'calypso/a8c-for-agencies/sections/marketplace/types';
import type { APIProductFamilyProduct as APIProductFamilyProductA4A } from 'calypso/a8c-for-agencies/types/products';

type Props = {
	product: APIProductFamilyProduct | APIProductFamilyProductA4A;
	quantity?: number;
	termPricing?: TermPricingType;
};

const LicenseLightboxJetpackManageLicense: FunctionComponent< Props > = ( {
	product,
	quantity,
	termPricing,
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
				{ isA4A ? (
					<ProductPriceWithDiscountA4A
						termPricing={ termPricing }
						product={ product as APIProductFamilyProductA4A }
						quantity={ quantity }
					/>
				) : (
					<ProductPriceWithDiscount product={ product } quantity={ quantity } />
				) }
			</div>
		</div>
	);
};

export default LicenseLightboxJetpackManageLicense;
