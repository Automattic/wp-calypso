import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { useProductDescription } from '../hooks';
import LicenseLightbox from '../license-lightbox-wrapper';
import { getProductTitle } from '../utils';

import './style.scss';

interface Props {
	tabIndex: number;
	product: APIProductFamilyProduct;
	onSelectProduct: ( value: APIProductFamilyProduct ) => void | null;
}

export default function LicenseBundleCard( props: Props ) {
	const { tabIndex, product, onSelectProduct } = props;
	const productTitle = getProductTitle( product.name );
	const translate = useTranslate();

	const onSelect = useCallback( () => {
		onSelectProduct( product );
	}, [ onSelectProduct, product ] );

	const { description: productDescription } = useProductDescription( product.slug );

	return (
		<div className="license-bundle-card">
			<div className="license-bundle-card__details">
				<h3 className="license-bundle-card__title">{ productTitle }</h3>

				<div className="license-bundle-card__description">{ productDescription }</div>

				<LicenseLightbox
					product={ product }
					ctaLabel={ translate( 'Select License' ) }
					onActivate={ onSelect }
				/>
			</div>

			<div className="license-bundle-card__footer">
				<div className="license-bundle-card__pricing">
					<div className="license-bundle-card__price">
						{ formatCurrency( product.amount, product.currency ) }
					</div>
					<div className="license-bundle-card__price-interval">
						{ product.price_interval === 'day' && translate( '/USD per license per day' ) }
						{ product.price_interval === 'month' && translate( '/USD per license per month' ) }
					</div>
				</div>

				<Button
					primary
					className="license-bundle-card__select-license"
					onClick={ onSelect }
					tabIndex={ tabIndex }
				>
					{ translate( 'Select' ) }
				</Button>
			</div>
		</div>
	);
}

LicenseBundleCard.defaultProps = {
	onSelectProduct: null,
};
