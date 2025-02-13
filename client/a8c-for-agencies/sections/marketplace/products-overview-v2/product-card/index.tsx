import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link';
import withProductLightbox, {
	ProductLightboxActivatorProps,
	WithProductLightboxProps,
} from '../hocs/with-product-lightbox';
import ProductBadges from '../product-badges';
import ProductPriceWithDiscount from './product-price-with-discount-info';

import './style.scss';

type Props = WithProductLightboxProps &
	ProductLightboxActivatorProps & {
		suggestedProduct?: string | null;
		hideDiscount?: boolean;
	};

function ProductCard( props: Props ) {
	const {
		asReferral,
		currentProduct,
		isSelected,
		isDisabled,
		onSelectProduct,
		suggestedProduct,
		hideDiscount,
		quantity,
		onShowLightbox,
	} = props;
	const productTitle = getProductShortTitle( currentProduct );

	const translate = useTranslate();

	const onSelect = useCallback( () => {
		if ( isDisabled ) {
			return;
		}

		onSelectProduct?.( currentProduct );
	}, [ isDisabled, onSelectProduct, currentProduct ] );

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

			if ( suggestedProducts.includes( currentProduct.slug ) ) {
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

	const { description: productDescription } = useProductDescription( currentProduct.slug );

	const ctaLabel = useMemo( () => {
		const selectedQuantity = quantity ?? 1;

		if ( asReferral ) {
			return isSelected ? translate( 'Added to referral' ) : translate( 'Add to referral' );
		}

		if ( selectedQuantity > 1 ) {
			return isSelected
				? translate( 'Added %(quantity)s to cart', { args: { quantity: selectedQuantity } } )
				: translate( 'Add %(quantity)s to cart', { args: { quantity: selectedQuantity } } );
		}

		return isSelected ? translate( 'Added to cart' ) : translate( 'Add to cart' );
	}, [ asReferral, isSelected, quantity, translate ] );

	const isRedesign = isEnabled( 'a4a-product-page-redesign' );

	return (
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
							<ProductBadges product={ currentProduct } />
							<div className="product-card__pricing is-compact">
								<ProductPriceWithDiscount
									product={ currentProduct }
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
						icon={ isSelected ? check : undefined }
					>
						{ ctaLabel }
					</Button>
					{ ! /^jetpack-backup-addon-storage-/.test( currentProduct.slug ) && (
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
	);
}

export default withProductLightbox( ProductCard );
