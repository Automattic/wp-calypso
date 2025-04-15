import { Button } from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import {
	withTooltip,
	WithTooltipProps,
} from 'calypso/a8c-for-agencies/components/hoc/with-tooltip';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import getProductVariantShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-variant-short-title';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link';
import { preventWidows } from 'calypso/lib/formatting/prevent-widows';
import withProductLightbox, {
	ProductLightboxActivatorProps,
	WithProductLightboxProps,
} from '../hocs/with-product-lightbox';
import ProductBadges from '../product-badges';
import useCustomProductCard from './hooks/use-custom-product-card';
import ProductPriceWithDiscount from './product-price-with-discount-info';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

type Props = WithProductLightboxProps &
	WithTooltipProps &
	ProductLightboxActivatorProps & {
		suggestedProduct?: string | null;
		hideDiscount?: boolean;
		onVariantChange?: ( value: APIProductFamilyProduct ) => void;
		withCustomCard?: boolean;
	};

function ProductCard( props: Props ) {
	const {
		asReferral,
		products,
		isSelected,
		isDisabled,
		onSelectProduct,
		onVariantChange,
		suggestedProduct,
		hideDiscount,
		quantity,
		currentProduct,
		setCurrentProduct,
		onShowLightbox,
		withCustomCard,
	} = props;
	const translate = useTranslate();

	const { description: productDescription } = useProductDescription( currentProduct.slug );

	const customProductCard = useCustomProductCard( withCustomCard ? currentProduct : null );

	const variantOptions = products.map( ( option ) => ( {
		id: option.slug,
		answerText: getProductVariantShortTitle( option.name ),
	} ) );

	const onSelect = useCallback( () => {
		if ( isDisabled ) {
			return;
		}

		onSelectProduct?.( currentProduct );
	}, [ isDisabled, onSelectProduct, currentProduct ] );

	const onKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLDivElement > ) => {
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
		// Do not add onSelect to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ currentProduct.slug, suggestedProduct ] );

	const onChangeOption = useCallback(
		( selectedProductSlug: string ) => {
			if ( isDisabled ) {
				return;
			}

			const selectedProduct =
				products.find( ( { slug } ) => slug === selectedProductSlug ) ?? products[ 0 ];

			if ( isSelected ) {
				// If the current card is selected, we need to update selected licenses.
				onSelectProduct?.( selectedProduct, currentProduct );
			}

			setCurrentProduct( selectedProduct );
			onVariantChange?.( selectedProduct );
		},
		[
			isDisabled,
			products,
			isSelected,
			setCurrentProduct,
			onVariantChange,
			onSelectProduct,
			currentProduct,
		]
	);

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

	const hasMultipleProducts = products.length > 1;

	const productTitle = getProductShortTitle( currentProduct, hasMultipleProducts );

	return (
		<div
			className={ clsx( 'product-card', customProductCard?.className, {
				'product-card--with-variant': hasMultipleProducts,
				selected: isSelected,
				disabled: isDisabled,
			} ) }
			onKeyDown={ onKeyDown }
			onClick={ onSelect }
			role="button"
			aria-disabled={ isDisabled }
			tabIndex={ 0 }
		>
			<div className="product-card__inner">
				<div className="product-card__details">
					<div className="product-card__main">
						<div className="product-card__heading">
							{ customProductCard?.image && (
								<img
									src={ customProductCard?.image }
									alt={ `${ currentProduct?.name } product logo` }
								/>
							) }

							<h3 className="product-card__title">{ customProductCard?.title ?? productTitle }</h3>

							{ ! customProductCard && (
								<>
									<ProductBadges product={ currentProduct } />
									<div className="product-card__pricing is-compact">
										<ProductPriceWithDiscount
											product={ currentProduct }
											hideDiscount={ hideDiscount }
											quantity={ quantity }
											compact
										/>
									</div>

									{ hasMultipleProducts && (
										<MultipleChoiceQuestion
											name={ `${ currentProduct.family_slug }-variant-options` }
											question={ translate( 'Select variant:' ) }
											answers={ variantOptions }
											selectedAnswerId={ currentProduct.slug }
											onAnswerChange={ onChangeOption }
											shouldShuffleAnswers={ false }
										/>
									) }
								</>
							) }

							<div className="product-card__description">
								{ preventWidows( customProductCard?.description ?? productDescription ) }
							</div>
						</div>
					</div>
				</div>
				<div className="product-card__buttons">
					<Button
						className={ clsx( 'product-card__select-button', {
							'is-selected': isSelected,
						} ) }
						variant={ ! isSelected || customProductCard ? 'primary' : 'secondary' }
						tabIndex={ -1 }
						icon={ isSelected ? check : undefined }
					>
						{ ctaLabel }
					</Button>
					{ ! /^jetpack-backup-addon-storage-/.test( currentProduct.slug ) && (
						<LicenseLightboxLink
							customText={ translate( 'View details' ) }
							productName={ getProductShortTitle( currentProduct ) }
							onClick={ onShowLightbox }
							showIcon={ false }
						/>
					) }
				</div>
			</div>
		</div>
	);
}

export default withProductLightbox( withTooltip( ProductCard ) );
