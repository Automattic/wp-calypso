import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import {
	useProductDescription,
	useURLQueryParams,
} from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { LICENSE_INFO_MODAL_ID } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import getProductShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-short-title';
import getProductVariantShortTitle from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-product-variant-short-title';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import LicenseLightboxLink from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox-link';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import ProductBadges from '../product-badges';
import ProductPriceWithDiscount from '../product-card/product-price-with-discount-info';

import '../product-card/style.scss';

interface Props {
	asReferral?: boolean;
	products: APIProductFamilyProduct[];
	isSelected: boolean;
	isDisabled?: boolean;
	onSelectProduct: (
		value: APIProductFamilyProduct,
		replace?: APIProductFamilyProduct
	) => void | null;
	onVariantChange?: ( value: APIProductFamilyProduct ) => void;
	suggestedProduct?: string | null;
	hideDiscount?: boolean;
	quantity?: number;
	selectedOption: APIProductFamilyProduct;
}

export default function MultiProductCard( props: Props ) {
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
		selectedOption,
	} = props;
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ product, setProduct ] = useState( products[ 0 ] );
	const { description: productDescription } = useProductDescription( product.slug );

	const { setParams, resetParams, getParamValue } = useURLQueryParams();
	const [ showLightbox, setShowLightbox ] = useState(
		getParamValue( LICENSE_INFO_MODAL_ID ) === product.slug
	);

	const variantOptions = products.map( ( option ) => ( {
		id: option.slug,
		answerText: getProductVariantShortTitle( option.name ),
	} ) );

	const onSelect = useCallback( () => {
		if ( isDisabled ) {
			return;
		}

		onSelectProduct?.( product );
	}, [ isDisabled, onSelectProduct, product ] );

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

			if ( suggestedProducts.includes( product.slug ) ) {
				onSelect();
			}
		}
		// Do not add onSelect to the dependency array as it will cause an infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ product.slug, suggestedProduct ] );

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

	const onChangeOption = useCallback(
		( selectedProductSlug: string ) => {
			if ( isDisabled ) {
				return;
			}

			const selectedProduct =
				products.find( ( { slug } ) => slug === selectedProductSlug ) ?? products[ 0 ];

			if ( isSelected ) {
				// If the current card is selected, we need to update selected licenses.
				onSelectProduct?.( selectedProduct, product );
			}

			setProduct( selectedProduct );
			onVariantChange?.( selectedProduct );
		},
		[ isDisabled, isSelected, onSelectProduct, onVariantChange, product, products ]
	);

	useEffect( () => {
		if ( selectedOption ) {
			setProduct( selectedOption );
		}
	}, [ selectedOption ] );

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
		<>
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
								<h3 className="product-card__title">{ getProductShortTitle( product, true ) }</h3>
								<ProductBadges product={ product } />
								{ ! isRedesign && (
									<MultipleChoiceQuestion
										name={ `${ product.family_slug }-variant-options` }
										question={ translate( 'Select variant:' ) }
										answers={ variantOptions }
										selectedAnswerId={ product.slug }
										onAnswerChange={ onChangeOption }
										shouldShuffleAnswers={ false }
									/>
								) }

								<div className="product-card__pricing is-compact">
									<ProductPriceWithDiscount
										product={ product }
										hideDiscount={ hideDiscount }
										quantity={ quantity }
										compact
									/>
								</div>

								{ isRedesign && (
									<MultipleChoiceQuestion
										name={ `${ product.family_slug }-variant-options` }
										question={ translate( 'Select variant:' ) }
										answers={ variantOptions }
										selectedAnswerId={ product.slug }
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
						>
							{ isSelected && <Icon icon={ check } /> }
							{ ctaLabel }
						</Button>
						{ ! /^jetpack-backup-addon-storage-/.test( product.slug ) && (
							<LicenseLightboxLink
								customText={ translate( 'View details' ) }
								productName={ getProductShortTitle( product ) }
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

MultiProductCard.defaultProps = {
	onSelectProduct: null,
};
