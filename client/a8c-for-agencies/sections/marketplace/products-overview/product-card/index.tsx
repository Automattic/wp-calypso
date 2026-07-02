import { Button } from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import A4ANumberInputV2 from 'calypso/a8c-for-agencies/components/a4a-number-input-v2';
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
import {
	getPressableMemoryTarget,
	isPressablePhpMemoryAddon,
} from '../../lib/pressable-memory-addon';
import withProductLightbox, {
	ProductLightboxActivatorProps,
	WithProductLightboxProps,
} from '../hocs/with-product-lightbox';
import ProductBadges from '../product-badges';
import useCustomProductCard from './hooks/use-custom-product-card';
import ProductPriceWithDiscount from './product-price-with-discount-info';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

import './style.scss';

type Props = WithProductLightboxProps &
	WithTooltipProps &
	ProductLightboxActivatorProps & {
		suggestedProduct?: string | null;
		hideDiscount?: boolean;
		onVariantChange?: ( value: APIProductFamilyProduct ) => void;
		withCustomCard?: boolean;
		count?: number;
		maxQuantity?: number;
		onAddToCart?: ( product: APIProductFamilyProduct, quantity: number ) => void;
		onUpdateCartItemCount?: ( product: APIProductFamilyProduct, count: number ) => void;
		onRemoveFromCart?: ( product: APIProductFamilyProduct ) => void;
	};

export function ProductCard( props: Props ) {
	const {
		asReferral,
		termPricing,
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
		count = 0,
		maxQuantity = 99,
		onAddToCart,
		onUpdateCartItemCount,
		onRemoveFromCart,
	} = props;
	const translate = useTranslate();

	const inCart = count > 0;
	const showQuantityStepper = ! asReferral;

	// Before anything is in the cart the stepper is a local pending quantity; once
	// copies exist it reflects (and edits) the live cart count.
	const [ pendingQuantity, setPendingQuantity ] = useState( 1 );
	const stepperValue = inCart ? count : pendingQuantity;

	const pressableMemoryTarget = getPressableMemoryTarget( currentProduct );
	const isPressableMemoryAddon = isPressablePhpMemoryAddon( currentProduct );
	const { description: productDescription } = useProductDescription(
		currentProduct.slug,
		pressableMemoryTarget
	);

	const customProductCard = useCustomProductCard( withCustomCard ? currentProduct : null );

	const variantOptions = products.map( ( option ) => ( {
		id: option.slug,
		answerText: getProductVariantShortTitle( option.name ),
	} ) );

	// The primary action: referral toggles, agency mode adds the pending quantity.
	// A body/keyboard tap is a no-op once the product is already in the cart —
	// the stepper and the "Remove from cart" button take over from there.
	const onSelect = useCallback( () => {
		if ( isDisabled ) {
			return;
		}

		if ( asReferral ) {
			onSelectProduct?.( currentProduct );
			return;
		}

		if ( inCart ) {
			return;
		}

		onAddToCart?.( currentProduct, pendingQuantity );
	}, [
		isDisabled,
		asReferral,
		inCart,
		onSelectProduct,
		onAddToCart,
		currentProduct,
		pendingQuantity,
	] );

	const onClickPrimaryButton = useCallback(
		( event: React.MouseEvent ) => {
			event.stopPropagation();

			if ( isDisabled ) {
				return;
			}

			if ( asReferral ) {
				onSelectProduct?.( currentProduct );
				return;
			}

			if ( inCart ) {
				onRemoveFromCart?.( currentProduct );
				return;
			}

			onAddToCart?.( currentProduct, pendingQuantity );
		},
		[
			isDisabled,
			asReferral,
			inCart,
			onSelectProduct,
			onRemoveFromCart,
			onAddToCart,
			currentProduct,
			pendingQuantity,
		]
	);

	const onChangeQuantity = useCallback(
		( value: number ) => {
			if ( inCart ) {
				onUpdateCartItemCount?.( currentProduct, value );
				return;
			}

			setPendingQuantity( value );
		},
		[ inCart, onUpdateCartItemCount, currentProduct ]
	);

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
		if ( asReferral ) {
			return isSelected ? translate( 'Added to referral' ) : translate( 'Add to referral' );
		}

		if ( inCart ) {
			return translate( 'Remove from cart' );
		}

		if ( stepperValue > 1 ) {
			return translate( 'Add %(quantity)s to cart', { args: { quantity: stepperValue } } );
		}

		return translate( 'Add to cart' );
	}, [ asReferral, isSelected, inCart, stepperValue, translate ] );

	const showSelectedState = asReferral ? isSelected : inCart;

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
											termPricing={ termPricing }
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
							{ isPressableMemoryAddon && (
								<div className="product-card__target-domain">
									{ pressableMemoryTarget
										? translate( 'Applies to %(siteDomain)s', {
												args: { siteDomain: pressableMemoryTarget },
												comment: '%(siteDomain)s is the target site/domain for the add-on.',
										  } )
										: translate( 'Applies to one Pressable site/domain.' ) }
								</div>
							) }
						</div>
					</div>
				</div>
				<div className="product-card__buttons">
					<div className="product-card__primary-action">
						<Button
							className={ clsx( 'product-card__select-button', {
								'is-selected': showSelectedState,
							} ) }
							variant={ ! showSelectedState || customProductCard ? 'primary' : 'secondary' }
							onClick={ onClickPrimaryButton }
							icon={ asReferral && isSelected ? check : undefined }
						>
							{ ctaLabel }
						</Button>
						{ showQuantityStepper && (
							// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
							<div
								className="product-card__quantity"
								onClick={ ( event ) => event.stopPropagation() }
							>
								<A4ANumberInputV2
									value={ stepperValue }
									onChange={ onChangeQuantity }
									maximum={ maxQuantity }
								/>
							</div>
						) }
						{ ! /^jetpack-backup-addon-storage-/.test( currentProduct.slug ) && (
							<div className="product-card__view-details">
								<LicenseLightboxLink
									customText={ translate( 'View details' ) }
									productName={ getProductShortTitle( currentProduct ) }
									onClick={ onShowLightbox }
									showIcon={ false }
								/>
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
}

export default withProductLightbox( withTooltip( ProductCard ) );
