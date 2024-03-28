import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	useProductDescription,
	useURLQueryParams,
} from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link';
import ProductPriceWithDiscount from 'calypso/jetpack-cloud/sections/partner-portal/primary/product-price-with-discount-info';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../../state/partner-portal/types';

import './style.scss';

interface Props {
	product: APIProductFamilyProduct;
	isSelected: boolean;
	isDisabled?: boolean;
	onSelectProduct: ( value: APIProductFamilyProduct ) => void | null;
	suggestedProduct?: string | null;
	hideDiscount?: boolean;
	quantity?: number;
}

export default function ProductCard( props: Props ) {
	const {
		product,
		isSelected,
		isDisabled,
		onSelectProduct,
		suggestedProduct,
		hideDiscount,
		quantity,
	} = props;

	const { setParams, resetParams, getParamValue } = useURLQueryParams();
	const modalParamValue = getParamValue( LICENSE_INFO_MODAL_ID );
	const productTitle = getProductShortTitle( product );

	const [ showLightbox, setShowLightbox ] = useState( modalParamValue === product.slug );
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onSelect = useCallback( () => {
		if ( isDisabled ) {
			return;
		}

		onSelectProduct?.( product );
	}, [ onSelectProduct, product ] );

	const onKeyDown = useCallback(
		( e: any ) => {
			// Enter
			if ( 13 === e.keyCode ) {
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

	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			e.stopPropagation();

			dispatch(
				recordTracksEvent( 'calypso_marketplace_products_overview_product_view', {
					product: product.slug,
				} )
			);

			setParams( [
				{
					key: LICENSE_INFO_MODAL_ID,
					value: product.slug,
				},
			] );
			setShowLightbox( true );
		},
		[ dispatch, product.slug, setParams ]
	);

	const onHideLightbox = useCallback( () => {
		resetParams( [ LICENSE_INFO_MODAL_ID ] );
		setShowLightbox( false );
	}, [ resetParams ] );

	return (
		<>
			<div
				onClick={ onSelect }
				onKeyDown={ onKeyDown }
				role="button"
				tabIndex={ 0 }
				aria-disabled={ isDisabled }
				className={ classNames( {
					'product-card': true,
					selected: isSelected,
					disabled: isDisabled,
				} ) }
			>
				<div className="product-card__inner">
					<div className="product-card__details">
						<div className="product-card__main">
							<div className="product-card__heading">
								<h3 className="product-card__title">{ productTitle }</h3>

								<div className="product-card__pricing is-compact">
									<ProductPriceWithDiscount
										product={ product }
										hideDiscount={ hideDiscount }
										quantity={ quantity }
										compact
									/>
								</div>

								<div className="product-card__description">{ productDescription }</div>

								{ ! /^jetpack-backup-addon-storage-/.test( product.slug ) && (
									<LicenseLightboxLink productName={ productTitle } onClick={ onShowLightbox } />
								) }
							</div>

							<Button
								className="product-card__select-button"
								variant={ isSelected ? 'secondary' : 'primary' }
								tabIndex={ -1 }
							>
								{ isSelected && <Icon icon={ check } /> }
								{ isSelected ? translate( 'Added' ) : translate( 'Add to cart' ) }
							</Button>
						</div>
					</div>
				</div>
			</div>
			{ showLightbox && (
				<LicenseLightbox
					product={ product }
					quantity={ quantity }
					ctaLabel={ isSelected ? translate( 'Remove from cart' ) : translate( 'Add to cart' ) }
					isCTAPrimary={ ! isSelected }
					isDisabled={ isDisabled }
					onActivate={ onSelectProduct }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
}

ProductCard.defaultProps = {
	onSelectProduct: null,
};
