import { useTranslate } from 'i18n-calypso';
import { useLicenseLightboxData } from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox/hooks/use-license-lightbox-data';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import type { ShoppingCartItem } from '../types';

export default function ProductInfo( { product }: { product: ShoppingCartItem } ) {
	const translate = useTranslate();

	const { title, product: productInfo } = useLicenseLightboxData( product );

	if ( ! productInfo ) {
		return null;
	}

	return (
		<div className="product-info">
			<div className="product-info__icon">
				<img src={ getProductIcon( { productSlug: productInfo.productSlug } ) } alt={ title } />
			</div>
			<div className="product-info__text-content">
				<div className="product-info__header">
					<label htmlFor={ title } className="product-info__label">
						{ title }
					</label>
					<span className="product-info__count">
						{ translate( '%(numLicenses)d plan', '%(numLicenses)d plans', {
							context: 'button label',
							count: product.quantity,
							args: {
								numLicenses: product.quantity,
							},
						} ) }
					</span>
				</div>
				<p className="product-info__description">{ productInfo.lightboxDescription }</p>
			</div>
		</div>
	);
}
