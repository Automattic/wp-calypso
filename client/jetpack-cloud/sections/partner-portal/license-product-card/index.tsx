import { Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { useProductDescription } from '../hooks';
import LicenseLightboxLink from '../license-lightbox-link';
import { getProductTitle } from '../utils';

import './style.scss';

interface Props {
	tabIndex: number;
	product: APIProductFamilyProduct;
	isSelected: boolean;
	isDisabled?: boolean;
	onSelectProduct: ( value: APIProductFamilyProduct | string ) => void | null;
	suggestedProduct?: string | null;
	isMultiSelect?: boolean;
}

export default function LicenseProductCard( props: Props ) {
	const {
		tabIndex,
		product,
		isSelected,
		isDisabled,
		onSelectProduct,
		suggestedProduct,
		isMultiSelect,
	} = props;
	const productTitle = getProductTitle( product.name );
	const translate = useTranslate();

	const onSelect = useCallback( () => {
		if ( isDisabled ) {
			return;
		}

		onSelectProduct?.( product );
	}, [ onSelectProduct, product ] );

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
			// Transform the comma-separated list of products to array.
			const suggestedProducts = suggestedProduct.split( ',' );

			if ( suggestedProducts.includes( product.slug ) ) {
				onSelect();
			}
		}
	}, [] );

	const { description: productDescription } = useProductDescription( product.slug );

	return (
		<>
			<div
				onClick={ onSelect }
				onKeyDown={ onKeyDown }
				role={ isMultiSelect ? 'checkbox' : 'radio' }
				tabIndex={ tabIndex }
				aria-checked={ isSelected }
				aria-disabled={ isDisabled }
				className={ classNames( {
					'license-product-card': true,
					selected: isSelected,
					disabled: isDisabled,
				} ) }
			>
				<div className="license-product-card__inner">
					<div className="license-product-card__details">
						<div className="license-product-card__main">
							<div className="license-product-card__heading">
								<h3 className="license-product-card__title">{ productTitle }</h3>

								<div className="license-product-card__description">{ productDescription }</div>

								<LicenseLightboxLink product={ product } />
							</div>

							<div
								className={ classNames( 'license-product-card__select-button', {
									'license-product-card_multi-select': isMultiSelect,
								} ) }
							>
								{ isSelected && <Gridicon icon="checkmark" /> }
							</div>
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
		</>
	);
}

LicenseProductCard.defaultProps = {
	onSelectProduct: null,
};
