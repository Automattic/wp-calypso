import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useProductDescription } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import getProductVariantShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-variant-short-title';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import withProductLightbox, {
	ProductLightboxActivatorProps,
	WithProductLightboxProps,
} from '../hocs/with-product-lightbox';
import ProductBadges from '../product-badges';
import ProductPriceWithDiscount from '../product-card/product-price-with-discount-info';

import '../product-card/style.scss';

type Props = WithProductLightboxProps &
	ProductLightboxActivatorProps & {
		suggestedProduct?: string | null;
		hideDiscount?: boolean;
		onVariantChange?: ( value: APIProductFamilyProduct ) => void;
	};

function MultiProductCard( props: Props ) {
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
	} = props;
	const translate = useTranslate();

	const { description: productDescription } = useProductDescription( currentProduct.slug );

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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

	const isRedesign = isEnabled( 'a4a-product-page-redesign' );

	return (
		<div
			className={ clsx( 'product-card', 'product-card--with-variant', {
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
							<h3 className="product-card__title">
								{ getProductShortTitle( currentProduct, true ) }
							</h3>
							<ProductBadges product={ currentProduct } />
							{ ! isRedesign && (
								<MultipleChoiceQuestion
									name={ `${ currentProduct.family_slug }-variant-options` }
									question={ translate( 'Select variant:' ) }
									answers={ variantOptions }
									selectedAnswerId={ currentProduct.slug }
									onAnswerChange={ onChangeOption }
									shouldShuffleAnswers={ false }
								/>
							) }

							<div className="product-card__pricing is-compact">
								<ProductPriceWithDiscount
									product={ currentProduct }
									hideDiscount={ hideDiscount }
									quantity={ quantity }
									compact
								/>
							</div>

							{ isRedesign && (
								<MultipleChoiceQuestion
									name={ `${ currentProduct.family_slug }-variant-options` }
									question={ translate( 'Select variant:' ) }
									answers={ variantOptions }
									selectedAnswerId={ currentProduct.slug }
									onAnswerChange={ onChangeOption }
									shouldShuffleAnswers={ false }
								/>
							) }

							<div className="product-card__description">{ productDescription }</div>
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
							productName={ getProductShortTitle( currentProduct ) }
							onClick={ onShowLightbox }
							showIcon={ ! isRedesign }
						/>
					) }
				</div>
			</div>
		</div>
	);
}

export default withProductLightbox( MultiProductCard );
