import { Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { getProductTitle } from '../utils';
import './style.scss';

interface Props {
	tabIndex: number;
	product: APIProductFamilyProduct;
	isSelected: boolean;
	onSelectProduct: ( value: string ) => void | null;
	suggestedProduct?: string | null;
}

export default function LicenseProductCard( props: Props ) {
	const { tabIndex, product, isSelected, onSelectProduct, suggestedProduct } = props;
	const productTitle = getProductTitle( product.name );
	const translate = useTranslate();

	const onSelect = useCallback( () => {
		onSelectProduct?.( product.slug );
	}, [ onSelectProduct ] );

	const onKeyDown = useCallback(
		( e: any ) => {
			// Spacebar
			if ( 32 === e.keyCode ) {
				onSelect();
			}
		},
		[ onSelect ]
	);

	useEffect( () => {
		if ( suggestedProduct ) {
			if ( product.slug === suggestedProduct ) {
				onSelect();
			}
		}
	}, [ onSelect, product, suggestedProduct ] );

	return (
		<div
			onClick={ onSelect }
			onKeyDown={ onKeyDown }
			role="radio"
			tabIndex={ tabIndex }
			aria-checked={ isSelected }
			className={ classNames( {
				'license-product-card': true,
				selected: isSelected,
			} ) }
		>
			<div className="license-product-card__inner">
				<div className="license-product-card__details">
					<h3 className="license-product-card__title">{ productTitle }</h3>
					<div className="license-product-card__radio">
						{ isSelected && <Gridicon icon="checkmark" /> }
					</div>
					<div className="license-product-card__pricing">
						<div className="license-product-card__price">
							{ formatCurrency( product.amount, product.currency ) }
						</div>
						<div className="license-product-card__price-interval">
							{ product.price_interval === 'day' && translate( '/USD per license per day' ) }
							{ product.price_interval === 'month' && translate( '/USD per license per month' ) }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

LicenseProductCard.defaultProps = {
	onSelectProduct: null,
};
