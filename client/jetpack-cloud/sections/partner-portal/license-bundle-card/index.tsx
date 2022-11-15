import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import LicenseBundleCardDescription from 'calypso/jetpack-cloud/sections/partner-portal/license-bundle-card-description';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
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

	const onSelect = () => {
		onSelectProduct( product );
	};

	return (
		<div className="license-bundle-card">
			<div className="license-bundle-card__details">
				<h3 className="license-bundle-card__title">{ productTitle }</h3>
				<LicenseBundleCardDescription product={ product } />
				<div className="license-bundle-card__pricing">
					<div className="license-bundle-card__price">
						{ formatCurrency( product.amount, product.currency ) }
					</div>
					<div className="license-bundle-card__price-interval">
						{ product.price_interval === 'day' && translate( '/USD per license per day' ) }
						{ product.price_interval === 'month' && translate( '/USD per license per month' ) }
					</div>
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
	);
}

LicenseBundleCard.defaultProps = {
	onSelectProduct: null,
};
