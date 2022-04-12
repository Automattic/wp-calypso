import { Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useCallback } from 'react';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import './style.scss';

interface Props {
	tabIndex: number;
	product: APIProductFamilyProduct;
	isSelected: boolean;
	onSelectProduct: ( value: string ) => void | null;
}

export default function LicenseProductCard( props: Props ): ReactElement {
	const { tabIndex, product, isSelected, onSelectProduct } = props;
	const productTitle = product.name.replace( 'Jetpack ', '' ).replace( '(', '' ).replace( ')', '' );
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
							{ product.price_interval === 'day' && translate( '/per license per day' ) }
							{ product.price_interval === 'month' && translate( '/per license per month' ) }
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
