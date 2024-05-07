import {
	isJetpackPlanSlug,
	JETPACK_RELATED_PRODUCTS_MAP,
	isJetpackAISlug,
} from '@automattic/calypso-products';
import { Button, SelectDropdown } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { useCallback, useEffect, useMemo } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import JetpackLightbox, {
	JetpackLightboxAside,
	JetpackLightboxMain,
} from 'calypso/components/jetpack/jetpack-lightbox';
import useMobileSidebar from 'calypso/components/jetpack/jetpack-lightbox/hooks/use-mobile-sidebar';
import JetpackProductInfo from 'calypso/components/jetpack/jetpack-product-info';
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { getProductPartsFromAlias } from 'calypso/my-sites/checkout/src/hooks/use-prepare-products-for-cart';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { useStoreItemInfoContext } from '../product-store/context/store-item-info-context';
import { PricingBreakdown } from '../product-store/pricing-breakdown';
import { ProductStoreBaseProps } from '../product-store/types';
import slugToSelectorProduct from '../slug-to-selector-product';
import { Duration, SelectorProduct } from '../types';
import useItemPrice from '../use-item-price';
import { PRODUCT_OPTIONS, PRODUCT_OPTIONS_HEADER, PRODUCT_TIER_OPTIONS } from './constants';
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
	const listPrices = useItemPrice( siteId, product, product?.monthlyProductSlug || '' );
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

	const onDropdownTierSelect = useCallback(
		( { value: slug }: { value: string } ) => {
			if ( slug === 'support' ) {
				return;
			}

			onChangeProduct( slugToSelectorProduct( slug ) );
			const { slug: productSlug, quantity } = getProductPartsFromAlias( slug );

			dispatch(
				recordTracksEvent( 'calypso_product_lightbox_dropdown_tier_select', {
					site_id: siteId,
					product_slug: productSlug,
					quantity,
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

	const tierOptions = useMemo( () => {
		if ( ! isJetpackAISlug( product.productSlug ) ) {
			return [];
		}

		const tiers = listPrices.priceTierList || [];

		return [
			...tiers.map( ( tier ) => {
				const id = `${ product.productSlug }:-q-${ tier.maximum_units }`;

				return {
					value: id,
					label: PRODUCT_TIER_OPTIONS[ id ].toString(),
				};
			} ),
		];
	}, [ listPrices.priceTierList, product.productSlug ] );

	const variantOptions = useMemo( () => {
		const variants = JETPACK_RELATED_PRODUCTS_MAP[ product.productSlug ] || [];
		return variants.map( ( itemSlug ) => ( {
			id: itemSlug,
			answerText: PRODUCT_OPTIONS[ itemSlug ].toString(),
		} ) );
	}, [ product.productSlug ] );

	const { sidebarRef, mainRef, initMobileSidebar } = useMobileSidebar();

	const shouldShowOptions = variantOptions.length > 1;

	const shouldShowDropdown =
		isJetpackAISlug( product.productSlug ) && tierOptions.length > 1 && ! shouldShowOptions;

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
										name="product-variants"
										question={ PRODUCT_OPTIONS_HEADER[ product?.productSlug ] }
										answers={ variantOptions }
										selectedAnswerId={ product?.productSlug }
										onAnswerChange={ onChangeOption }
										shouldShuffleAnswers={ false }
									/>
								</div>
							</div>
						) }
						{ shouldShowDropdown && (
							<div className="product-lightbox__variants-dropdown">
								<FormFieldset>
									<FormLegend>{ PRODUCT_OPTIONS_HEADER[ product?.productSlug ] }</FormLegend>
									<SelectDropdown
										className="product-lightbox__tiers-dropdown"
										options={ tierOptions }
										onSelect={ onDropdownTierSelect }
										initialSelected={ tierOptions[ 0 ].value }
									/>
								</FormFieldset>
							</div>
						) }
						{ ! isOwned && (
							<PaymentPlan
								isMultiSiteIncompatible={ isMultiSiteIncompatible }
								siteId={ siteId }
								product={ product }
								quantity={ product.quantity }
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
