import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { useProductDescription } from '../hooks';
import LicenseLightbox from '../license-lightbox';
import LicenseLightboxLink from '../license-lightbox-link';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';
import { getProductTitle } from '../utils';

import './style.scss';

interface Props {
	tabIndex: number;
	product: APIProductFamilyProduct;
	isSelected: boolean;
	isDisabled?: boolean;
	onSelectProduct: ( value: APIProductFamilyProduct ) => void | null;
	suggestedProduct?: string | null;
	isMultiSelect?: boolean;
	showLicenseInfoModal: boolean;
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
		showLicenseInfoModal,
	} = props;
	const productTitle = getProductTitle( product.name );
	const [ showLightbox, setShowLightbox ] = useState( showLicenseInfoModal );
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

	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			e.stopPropagation();

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_view', {
					product: product.slug,
				} )
			);

			setShowLightbox( true );
		},
		[ dispatch, product ]
	);

	const onHideLightbox = useCallback( () => {
		setShowLightbox( false );
	}, [] );

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

								<LicenseLightboxLink productName={ productTitle } onClick={ onShowLightbox } />
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
							<ProductPriceWithDiscount product={ product } />
						</div>
					</div>
				</div>
			</div>

			{ showLightbox && (
				<LicenseLightbox
					product={ product }
					ctaLabel={ isSelected ? translate( 'Unselect License' ) : translate( 'Select License' ) }
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
