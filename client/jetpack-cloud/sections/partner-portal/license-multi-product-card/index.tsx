import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { useProductDescription, useURLQueryParams } from '../hooks';
import { LICENSE_INFO_MODAL_ID } from '../lib';
import getProductShortTitle from '../lib/get-product-short-title';
import getProductVariantShortTitle from '../lib/get-product-variant-short-title';
import LicenseLightbox from '../license-lightbox';
import LicenseLightboxLink from '../license-lightbox-link';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';

import '../license-product-card/style.scss';

interface Props {
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

export default function LicenseMultiProductCard( props: Props ) {
	const {
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

	return (
		<>
			<div
				className={ clsx( 'license-product-card', 'license-product-card--with-variant', {
					selected: isSelected,
					disabled: isDisabled,
				} ) }
				onKeyDown={ onKeyDown }
				onClick={ onSelect }
				role="checkbox"
				aria-checked={ isSelected }
				aria-disabled={ isDisabled }
				tabIndex={ 0 }
			>
				<div className="license-product-card__inner">
					<div className="license-product-card__details">
						<div className="license-product-card__main">
							<div className="license-product-card__heading">
								<h3 className="license-product-card__title">
									{ getProductShortTitle( product, true ) }
								</h3>

								<MultipleChoiceQuestion
									name={ `${ product.family_slug }-variant-options` }
									question={ translate( 'Select variant:' ) }
									answers={ variantOptions }
									selectedAnswerId={ product.slug }
									onAnswerChange={ onChangeOption }
									shouldShuffleAnswers={ false }
								/>

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
									<LicenseLightboxLink
										productName={ getProductShortTitle( product ) }
										onClick={ onShowLightbox }
									/>
								) }
							</div>

							<div className="license-product-card__select-button license-product-card_multi-select">
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

LicenseMultiProductCard.defaultProps = {
	onSelectProduct: null,
};
