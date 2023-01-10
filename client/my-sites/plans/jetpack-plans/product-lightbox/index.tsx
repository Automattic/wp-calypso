import { JetpackTag, JETPACK_RELATED_PRODUCTS_MAP } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { useStoreItemInfoContext } from '../product-store/context/store-item-info-context';
import { PricingBreakdown } from '../product-store/pricing-breakdown';
import { ProductStoreBaseProps } from '../product-store/types';
import getProductIcon from '../product-store/utils/get-product-icon';
import slugToSelectorProduct from '../slug-to-selector-product';
import { Duration, SelectorProduct } from '../types';
import { PRODUCT_OPTIONS, PRODUCT_OPTIONS_HEADER } from './constants';
import { Icons } from './icons/icons';
import { Tags } from './icons/tags';
import PaymentPlan from './payment-plan';
import ProductDetails from './product-details';

import './style.scss';

type Props = ProductStoreBaseProps & {
	product: SelectorProduct;
	isVisible: boolean;
	duration: Duration;
	onClose: () => void;
	onChangeProduct: ( product: SelectorProduct | null ) => void;
	siteId: number | null;
};

const TagItems: React.FC< { tags: JetpackTag[] } > = ( { tags } ) => (
	<ul className="product-lightbox__detail-tags-list">
		{ tags.map( ( tag ) => (
			<li className="product-lightbox__detail-tags-tag" key={ tag.tag }>
				<span aria-hidden="true">{ Tags[ tag.tag ] }</span>
				<p>{ tag.label }</p>
			</li>
		) ) }
	</ul>
);

const ProductLightbox: React.FC< Props > = ( {
	product,
	isVisible,
	onClose,
	onChangeProduct,
	siteId,
} ) => {
	const close = useCallback( () => onClose?.(), [ onClose ] );
	const dispatch = useDispatch();
	const translate = useTranslate();

	const onChangeOption = useCallback(
		( productSlug: string ) => {
			onChangeProduct( slugToSelectorProduct( productSlug ) );

			// Tracking when variant selected inside the lightbox
			dispatch(
				recordTracksEvent( 'calypso_product_lightbox_variant_select', {
					site_id: siteId,
					product_slug: productSlug,
				} )
			);
		},
		[ onChangeProduct, dispatch, siteId ]
	);

	const { getCheckoutURL, getIsMultisiteCompatible, isMultisite, getOnClickPurchase } =
		useStoreItemInfoContext();

	const onCheckoutClick = useCallback( () => {
		getOnClickPurchase( product )();
		// Tracking when checkout is clicked
		dispatch(
			recordTracksEvent( 'calypso_product_lightbox_checkout_click', {
				site_id: siteId,
				product_slug: product.productSlug,
			} )
		);
	}, [ dispatch, getOnClickPurchase, product, siteId ] );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_product_lightbox_open', {
				site_id: siteId,
				product_slug: product.productSlug,
			} )
		);
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	const variantOptions = useMemo( () => {
		const variants = JETPACK_RELATED_PRODUCTS_MAP[ product.productSlug ] || [];
		return variants.map( ( itemSlug ) => ( {
			id: itemSlug,
			answerText: PRODUCT_OPTIONS[ itemSlug ].toString(),
		} ) );
	}, [ product.productSlug ] );

	const shouldShowOptions = variantOptions.length > 1;

	const isMultiSiteIncompatible = isMultisite && ! getIsMultisiteCompatible( product );

	const includedProductSlugs = product.productsIncluded || [];

	const isLargeScreen = useBreakpoint( '>782px' );

	const showPricingBreakdown = includedProductSlugs?.length;

	return (
		<Modal
			className="product-lightbox__modal"
			overlayClassName="product-lightbox__modal-overlay"
			isOpen={ isVisible }
			onRequestClose={ close }
			htmlOpenClassName="ReactModal__Html--open lightbox-mode"
		>
			<div className="product-lightbox__content-wrapper">
				<Button
					className="product-lightbox__close-button"
					plain
					onClick={ close }
					aria-label={
						translate( 'Close', {
							comment:
								'Text read by screen readers when the close button of the lightbox gets focus.',
						} ) as string
					}
				>
					{ Icons.close }
				</Button>
				<div className="product-lightbox__detail">
					<div className="product-lightbox__detail-header">
						<div className="product-lightbox__product-icon">
							<img alt="" src={ getProductIcon( { productSlug: product.productSlug } ) } />
						</div>
						<h2>{ product.displayName }</h2>
					</div>
					<div className="product-lightbox__detail-desc">{ product.lightboxDescription }</div>

					{ showPricingBreakdown && ! isLargeScreen ? (
						<PricingBreakdown
							includedProductSlugs={ includedProductSlugs }
							product={ product }
							showBreakdownHeading
							siteId={ siteId }
						/>
					) : null }

					{ ( ( includedProductSlugs?.length && isLargeScreen ) ||
						! includedProductSlugs?.length ) && (
						<div className="product-lightbox__detail-tags">
							<span className="product-lightbox__detail-tags-label">
								{ translate( 'Great for:' ) }
							</span>
							{ product.recommendedFor && <TagItems tags={ product.recommendedFor } /> }
						</div>
					) }

					<ProductDetails product={ product } />
				</div>
				<div className="product-lightbox__sidebar">
					<div className="product-lightbox__variants">
						<div className="product-lightbox__variants-content">
							{ shouldShowOptions && (
								<div className="product-lightbox__variants-options">
									<MultipleChoiceQuestion
										question={ PRODUCT_OPTIONS_HEADER[ product?.productSlug ] }
										answers={ variantOptions }
										selectedAnswerId={ product?.productSlug }
										onAnswerChange={ onChangeOption }
										shouldShuffleAnswers={ false }
									/>
								</div>
							) }
							<PaymentPlan
								isMultiSiteIncompatible={ isMultiSiteIncompatible }
								siteId={ siteId }
								product={ product }
							/>
							<Button
								primary
								onClick={ onCheckoutClick }
								className="jetpack-product-card__button product-lightbox__checkout-button"
								href={ isMultiSiteIncompatible ? '#' : getCheckoutURL( product ) }
								disabled={ isMultiSiteIncompatible }
							>
								{ translate( 'Proceed to checkout' ) }
							</Button>
						</div>
					</div>
					{ showPricingBreakdown && isLargeScreen ? (
						<PricingBreakdown
							includedProductSlugs={ includedProductSlugs }
							product={ product }
							siteId={ siteId }
						/>
					) : null }
				</div>
			</div>
		</Modal>
	);
};

export default ProductLightbox;
