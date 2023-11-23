import { useTranslate } from 'i18n-calypso';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import { useLicenseLightboxData } from '../../license-lightbox/hooks/use-license-lightbox-data';
import type { SelectedLicenseProp } from '../types';

export default function LicenseInfo( { product }: { product: SelectedLicenseProp } ) {
	const translate = useTranslate();

	const { title, product: productInfo } = useLicenseLightboxData( product );

	if ( ! productInfo ) {
		return null;
	}

	return (
		<div className="review-licenses__selected-license">
			<div className="review-licenses__details">
				<div className="review-licenses__icon">
					<img src={ getProductIcon( { productSlug: productInfo.productSlug } ) } alt={ title } />
				</div>
				<div className="review-licenses__text-content">
					<div className="review-licenses__header">
						<label htmlFor={ title } className="review-licenses__label">
							{ title }
						</label>
						<span className="review-licenses__count">
							{ translate( '%(numLicenses)d license', '%(numLicenses)d licenses', {
								context: 'button label',
								count: product.quantity,
								args: {
									numLicenses: product.quantity,
								},
							} ) }
						</span>
					</div>
					<p className="review-licenses__info">{ productInfo.lightboxDescription }</p>
				</div>
			</div>
		</div>
	);
}
