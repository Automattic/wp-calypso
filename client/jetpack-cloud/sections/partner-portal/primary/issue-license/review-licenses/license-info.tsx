import { useTranslate } from 'i18n-calypso';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import { useLicenseLightboxData } from '../../../license-lightbox/hooks/use-license-lightbox-data';
import type { SelectedLicenseProp } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

export default function LicenseInfo( {
	product,
	selectedSite,
}: {
	product: SelectedLicenseProp;
	selectedSite?: SiteDetails | null;
} ) {
	const translate = useTranslate();

	const { title, product: productInfo } = useLicenseLightboxData( product );

	if ( ! productInfo ) {
		return null;
	}

	return (
		<div className="review-licenses__selected-license">
			<div className="review-licenses__license-details">
				<div className="review-licenses__license-icon">
					<img src={ getProductIcon( { productSlug: productInfo.productSlug } ) } alt={ title } />
				</div>
				<div className="review-licenses__license-text-content">
					<div className="review-licenses__license-header">
						<label htmlFor={ title } className="review-licenses__license-label">
							{ title }
						</label>
						{ ! selectedSite && (
							<span className="review-licenses__license-count">
								{ translate( '%(numLicenses)d license', '%(numLicenses)d licenses', {
									context: 'button label',
									count: product.quantity,
									args: {
										numLicenses: product.quantity,
									},
								} ) }
							</span>
						) }
					</div>
					<p className="review-licenses__license-description">
						{ productInfo.lightboxDescription }
					</p>
				</div>
			</div>
		</div>
	);
}
