import { isJetpackPlanSlug, JETPACK_RELATED_PRODUCTS_MAP } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useCallback, useEffect, useMemo } from 'react';
import JetpackLightbox, {
	JetpackLightboxAside,
	JetpackLightboxMain,
} from 'calypso/components/jetpack/jetpack-lightbox';
import useMobileSidebar from 'calypso/components/jetpack/jetpack-lightbox/hooks/use-mobile-sidebar';
import JetpackProductInfo from 'calypso/components/jetpack/jetpack-product-info';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { useStoreItemInfoContext } from '../product-store/context/store-item-info-context';
import { PricingBreakdown } from '../product-store/pricing-breakdown';
import { ProductStoreBaseProps } from '../product-store/types';
import slugToSelectorProduct from '../slug-to-selector-product';
import { Duration, SelectorProduct } from '../types';
import { PRODUCT_OPTIONS, PRODUCT_OPTIONS_HEADER } from './constants';
import PaymentPlan from './payment-plan';

import './style.scss';

type Props = ProductStoreBaseProps & {
	product: SelectorProduct;
	isVisible: boolean;
	duration: Duration;
	onClose: () => void;
	onChangeProduct: ( product: SelectorProduct | null ) => void;
	siteId: number | null;
};

const ProductLightbox: React.FC< Props > = ( {
	product,
	isVisible,
	onClose,
	onChangeProduct,
	siteId,
} ) => {
	const close = useCallback( () => onClose?.(), [ onClose ] );
	const dispatch = useDispatch();

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

	const {
		getCheckoutURL,
		getIsMultisiteCompatible,
		isMultisite,
		getOnClickPurchase,
		getLightBoxCtaLabel,
		getIsProductInCart,
		getIsOwned,
	} = useStoreItemInfoContext();

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

	const { sidebarRef, mainRef, initMobileSidebar } = useMobileSidebar();

	const shouldShowOptions = variantOptions.length > 1;

	const isMultiSiteIncompatible = isMultisite && ! getIsMultisiteCompatible( product );

	const includedProductSlugs = product.productsIncluded || [];

	const isLargeScreen = useBreakpoint( '>782px' );

	const showPricingBreakdown = !! includedProductSlugs?.length;

	const isProductInCart =
		! isJetpackPlanSlug( product.productSlug ) && getIsProductInCart( product );

	const isOwned = getIsOwned( product );

	return (
		<JetpackLightbox
			className="product-lightbox"
			isOpen={ isVisible }
			onClose={ close }
			onAfterOpen={ initMobileSidebar }
		>
			<JetpackLightboxMain ref={ mainRef }>
				<JetpackProductInfo
					title={ product.displayName }
					product={ product }
					full={ isLargeScreen }
					showPricingBreakdown={ showPricingBreakdown && ! isLargeScreen }
				/>
			</JetpackLightboxMain>

			<JetpackLightboxAside ref={ sidebarRef }>
				<div className="product-lightbox__variants">
					<div className="product-lightbox__variants-content">
						{ shouldShowOptions && (
							<div>
								<div className="product-lightbox__variants-options">
									<MultipleChoiceQuestion
										question={ PRODUCT_OPTIONS_HEADER[ product?.productSlug ] }
										answers={ variantOptions }
										selectedAnswerId={ product?.productSlug }
										onAnswerChange={ onChangeOption }
										shouldShuffleAnswers={ false }
									/>
								</div>
							</div>
						) }
						{ ! isOwned && (
							<PaymentPlan
								isMultiSiteIncompatible={ isMultiSiteIncompatible }
								siteId={ siteId }
								product={ product }
							/>
						) }
						<Button
							primary={ ! isProductInCart }
							onClick={ onCheckoutClick }
							className="jetpack-product-card__button product-lightbox__checkout-button"
							href={ isMultiSiteIncompatible ? '#' : getCheckoutURL( product ) }
							disabled={ isMultiSiteIncompatible }
						>
							{ getLightBoxCtaLabel( product ) }
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
			</JetpackLightboxAside>
		</JetpackLightbox>
	);
};

export default ProductLightbox;
