import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	useProductDescription,
	useURLQueryParams,
} from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../../state/partner-portal/types';
import ProductPriceWithDiscount from './product-price-with-discount-info';

import './style.scss';

interface Props {
	asReferral?: boolean;
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
		asReferral,
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

	const truncateDescription = ( description: any ) => {
		if ( description.length <= 84 ) {
			return description;
		}

		const lastSpace = description.slice( 0, 82 ).lastIndexOf( ' ' );

		return description.slice( 0, lastSpace > 0 ? lastSpace : 83 ) + '…';
	};

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

	const ctaLabel = useMemo( () => {
		if ( asReferral ) {
			return isSelected ? translate( 'Added to referral' ) : translate( 'Add to referral' );
		}
		return isSelected ? translate( 'Added to cart' ) : translate( 'Add to cart' );
	}, [ asReferral, isSelected, translate ] );

	const ctaLightboxLabel = useMemo( () => {
		if ( asReferral ) {
			return isSelected ? translate( 'Remove from referral' ) : translate( 'Add to referral' );
		}
		return isSelected ? translate( 'Remove from cart' ) : translate( 'Add to cart' );
	}, [ asReferral, isSelected, translate ] );

	const isRedesign = isEnabled( 'a4a-product-page-redesign' );

	return (
		<>
			<div
				onClick={ onSelect }
				onKeyDown={ onKeyDown }
				role="button"
				tabIndex={ 0 }
				aria-disabled={ isDisabled }
				className={ clsx( {
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

								<div className="product-card__description">
									{ truncateDescription( productDescription ) }
								</div>
							</div>
						</div>
					</div>
					<div className="product-card__buttons">
						<Button
							className={ clsx( { 'product-card__select-button': ! isRedesign } ) }
							variant={ ! isSelected ? 'primary' : 'secondary' }
							tabIndex={ -1 }
						>
							{ isSelected && <Icon icon={ check } /> }
							{ ctaLabel }
						</Button>
						{ ! /^jetpack-backup-addon-storage-/.test( product.slug ) && (
							<LicenseLightboxLink
								customText={ translate( 'View details' ) }
								productName={ productTitle }
								onClick={ onShowLightbox }
								showIcon={ ! isRedesign }
							/>
						) }
					</div>
				</div>
			</div>
			{ showLightbox && (
				<LicenseLightbox
					product={ product }
					quantity={ quantity }
					ctaLabel={ ctaLightboxLabel }
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
