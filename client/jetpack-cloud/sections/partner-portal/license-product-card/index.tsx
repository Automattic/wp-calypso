import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { useProductDescription, useURLQueryParams } from '../hooks';
import { LICENSE_INFO_MODAL_ID } from '../lib';
import getProductShortTitle from '../lib/get-product-short-title';
import LicenseLightbox from '../license-lightbox';
import LicenseLightboxLink from '../license-lightbox-link';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';

import './style.scss';

interface Props {
	product: APIProductFamilyProduct;
	isSelected: boolean;
	isDisabled?: boolean;
	onSelectProduct: ( value: APIProductFamilyProduct ) => void | null;
	suggestedProduct?: string | null;
	isMultiSelect?: boolean;
	hideDiscount?: boolean;
	quantity?: number;
}

export default function LicenseProductCard( props: Props ) {
	const {
		product,
		isSelected,
		isDisabled,
		onSelectProduct,
		suggestedProduct,
		isMultiSelect,
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
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_view', {
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
				role={ isMultiSelect ? 'checkbox' : 'radio' }
				tabIndex={ 0 }
				aria-checked={ isSelected }
				aria-disabled={ isDisabled }
				className={ clsx( {
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

								<div className="license-product-card__pricing is-compact">
									<ProductPriceWithDiscount
										product={ product }
										hideDiscount={ hideDiscount }
										quantity={ quantity }
										compact
									/>
								</div>

								<div className="license-product-card__description">{ productDescription }</div>

								{ ! /^jetpack-backup-addon-storage-/.test( product.slug ) && (
									<LicenseLightboxLink productName={ productTitle } onClick={ onShowLightbox } />
								) }
							</div>

							<div
								className={ clsx( 'license-product-card__select-button', {
									'license-product-card_multi-select': isMultiSelect,
								} ) }
							>
								{ isSelected && <Gridicon icon="checkmark" /> }
							</div>
						</div>
					</div>
				</div>
			</div>
			{ showLightbox && (
				<LicenseLightbox
					product={ product }
					quantity={ quantity }
					ctaLabel={ isSelected ? translate( 'Unselect license' ) : translate( 'Select license' ) }
					isCTAPrimary={ ! isSelected }
					isDisabled={ isDisabled }
					onActivate={ onSelectProduct }
					onClose={ onHideLightbox }
				/>
			) }
		</>
	);
}

LicenseProductCard.defaultProps = {
	onSelectProduct: null,
};
