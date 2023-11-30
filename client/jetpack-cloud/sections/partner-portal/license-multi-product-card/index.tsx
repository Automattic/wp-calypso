import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from '../../../../state/partner-portal/types';
import { useProductDescription, useURLQueryParams } from '../hooks';
import { getProductTitle, LICENSE_INFO_MODAL_ID } from '../lib';
import getProductVariantShortTitle from '../lib/get-product-variant-short-title';
import LicenseLightbox from '../license-lightbox';
import LicenseLightboxLink from '../license-lightbox-link';
import ProductPriceWithDiscount from '../primary/product-price-with-discount-info';

import '../license-product-card/style.scss';

interface Props {
	tabIndex: number;
	products: APIProductFamilyProduct[];
	isSelected: boolean;
	isDisabled?: boolean;
	onSelectProduct: (
		value: APIProductFamilyProduct,
		replace?: APIProductFamilyProduct
	) => void | null;
	suggestedProduct?: string | null;
	hideDiscount?: boolean;
}

export default function LicenseMultiProductCard( props: Props ) {
	const {
		tabIndex,
		products,
		isSelected,
		isDisabled,
		onSelectProduct,
		suggestedProduct,
		hideDiscount,
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
	}, [ onSelect, product.slug, suggestedProduct ] );

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
		},
		[ isDisabled, isSelected, onSelectProduct, product, products ]
	);

	return (
		<>
			<div
				className={ classNames( 'license-product-card', 'license-product-card--with-variant', {
					selected: isSelected,
					disabled: isDisabled,
				} ) }
			>
				<div className="license-product-card__inner">
					<div className="license-product-card__details">
						<div className="license-product-card__main">
							<div className="license-product-card__heading">
								<h3 className="license-product-card__title">
									{ getProductTitle( product.name, true ) }
								</h3>

								<MultipleChoiceQuestion
									question={ translate( 'Select variant:' ) }
									answers={ variantOptions }
									selectedAnswerId={ product?.slug }
									onAnswerChange={ onChangeOption }
									shouldShuffleAnswers={ false }
								/>

								<div className="license-product-card__description">{ productDescription }</div>

								{ ! /^jetpack-backup-addon-storage-/.test( product.slug ) && (
									<LicenseLightboxLink
										productName={ getProductTitle( product.name ) }
										onClick={ onShowLightbox }
									/>
								) }
							</div>

							<div
								className="license-product-card__select-button license-product-card_multi-select"
								onKeyDown={ onKeyDown }
								onClick={ () => onSelect() }
								role="checkbox"
								aria-checked={ isSelected }
								aria-disabled={ isDisabled }
								tabIndex={ tabIndex }
							>
								{ isSelected && <Gridicon icon="checkmark" /> }
							</div>
						</div>

						<div className="license-product-card__pricing">
							<ProductPriceWithDiscount product={ product } hideDiscount={ hideDiscount } />
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

LicenseMultiProductCard.defaultProps = {
	onSelectProduct: null,
};
