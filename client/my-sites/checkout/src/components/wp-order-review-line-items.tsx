import config from '@automattic/calypso-config';
import {
	isAkismetProduct,
	isJetpackPurchasableItem,
	AKISMET_PRO_500_PRODUCTS,
	isWpComPlan,
} from '@automattic/calypso-products';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { isCopySiteFlow } from '@automattic/onboarding';
import {
	canItemBeRemovedFromCart,
	getCouponLineItemFromCart,
	getCreditsLineItemFromCart,
	isWpComProductRenewal,
	joinClasses,
	CouponLineItem,
	NonProductLineItem,
	LineItem,
	getPartnerCoupon,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { has100YearPlan } from 'calypso/lib/cart-values/cart-items';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { RemovedFromCartItem } from 'calypso/my-sites/checkout/src/components/removed-from-cart-item';
import {
	useCartProductsOrder,
	useRestorableProducts,
} from 'calypso/my-sites/checkout/src/components/restorable-products-context';
import { useGetProductVariants } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import {
	useStreamlinedPriceExperiment,
	isStreamlinedPriceCheckoutTreatment,
} from 'calypso/my-sites/plans-features-main/hooks/use-streamlined-price-experiment';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getIsOnboardingAffiliateFlow } from 'calypso/state/signup/flow/selectors';
import { getAffiliateCouponLabel } from '../../utils';
import { AkismetProQuantityDropDown } from './akismet-pro-quantity-dropdown';
import { ItemVariationPicker } from './item-variation-picker';
import type { OnChangeAkProQuantity } from './akismet-pro-quantity-dropdown';
import type { OnChangeItemVariant, WPCOMProductVariant } from './item-variation-picker';
import type {
	ResponseCart,
	RemoveProductFromCart,
	ReplaceProductInCart,
	ResponseCartProduct,
	RemoveCouponFromCart,
} from '@automattic/shopping-cart';
import type { PropsWithChildren, RefObject } from 'react';

interface LineItemByProductUuid {
	[ id: string ]: JSX.Element;
}

const WPOrderReviewList = styled.ul`
	box-sizing: border-box;
	margin: 24px 0 0 0;
	padding: 0;
`;

const WPOrderReviewListItem = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

export function WPOrderReviewSection( {
	children,
	className,
}: PropsWithChildren< {
	className?: string;
} > ) {
	return <div className={ joinClasses( [ className, 'order-review-section' ] ) }>{ children }</div>;
}

export function WPOrderReviewLineItems( {
	className,
	isSummary,
	removeProductFromCart,
	replaceProductInCart,
	removeCoupon,
	onChangeSelection,
	createUserAndSiteBeforeTransaction,
	responseCart,
	isPwpoUser,
	onRemoveProduct,
	onRemoveProductClick,
	onRemoveProductCancel,
}: {
	className?: string;
	isSummary?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	replaceProductInCart: ReplaceProductInCart;
	removeCoupon: RemoveCouponFromCart;
	onChangeSelection?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
} ) {
	const reduxDispatch = useDispatch();
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const isOnboardingAffiliateFlow = useSelector( getIsOnboardingAffiliateFlow );
	const [ cartProductsOrder, setCartProductsOrder ] = useCartProductsOrder();
	const [ restorableProducts, setRestorableProducts ] = useRestorableProducts();

	if ( couponLineItem ) {
		couponLineItem.label = isOnboardingAffiliateFlow
			? getAffiliateCouponLabel()
			: couponLineItem.label;
	}
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const hasPartnerCoupon = getPartnerCoupon( {
		coupon: responseCart.coupon,
	} );
	const [ initialProducts ] = useState( () => responseCart.products );
	const [ forceShowAkQuantityDropdown, setForceShowAkQuantityDropdown ] = useState( false );

	const isAkismetProMultipleLicensesCart = useMemo( () => {
		if ( ! config.isEnabled( 'akismet/checkout-quantity-dropdown' ) ) {
			return false;
		}
		if ( ! window.location.pathname.startsWith( '/checkout/akismet/' ) ) {
			return false;
		}

		return responseCart.products.every( ( product ) =>
			AKISMET_PRO_500_PRODUCTS.includes(
				product.product_slug as ( typeof AKISMET_PRO_500_PRODUCTS )[ number ]
			)
		);
	}, [ responseCart.products ] );

	// Initialize the order of products in the cart
	useEffect( () => {
		if ( ! cartProductsOrder.size ) {
			const newOrder = new Map();

			responseCart.products.forEach( ( product, position ) => {
				newOrder.set( product.uuid, { position, removed: false } );
			} );

			setCartProductsOrder( newOrder );
		}
	}, [ cartProductsOrder.size, responseCart.products, setCartProductsOrder ] );

	// Keep track of modified products (e.g. changing the duration of a plan)
	useEffect( () => {
		setCartProductsOrder( ( prevCartProductsOrder ) => {
			const newOrder = new Map( prevCartProductsOrder );

			const uuids = responseCart.products.map( ( product ) => product.uuid );
			const prevCartProductsOrderActiveUuids = Array.from( prevCartProductsOrder.entries() )
				.filter( ( [ , { removed } ] ) => ! removed )
				.map( ( [ uuid ] ) => uuid );
			const hasNewUuid = uuids.some(
				( uuid ) => ! prevCartProductsOrderActiveUuids.includes( uuid )
			);

			if ( hasNewUuid ) {
				const obsoleteUuid = prevCartProductsOrderActiveUuids.find(
					( uuid ) => ! uuids.includes( uuid )
				);
				const freshUuid = uuids.find(
					( uuid ) => ! prevCartProductsOrderActiveUuids.includes( uuid )
				);

				const isProductModified = obsoleteUuid && freshUuid;

				if ( isProductModified ) {
					const info = newOrder.get( obsoleteUuid );

					if ( info ) {
						newOrder.delete( obsoleteUuid );
						newOrder.set( freshUuid, info );
					}
				}
			}

			return newOrder;
		} );
	}, [ responseCart.products, setCartProductsOrder ] );

	// Keep track of added products using a different tab
	useEffect( () => {
		setCartProductsOrder( ( prevCartProductsOrder ) => {
			const newOrder = new Map( prevCartProductsOrder );

			const uuids = responseCart.products.map( ( product ) => product.uuid );
			const prevCartProductsOrderActiveUuids = Array.from( prevCartProductsOrder.entries() )
				.filter( ( [ , { removed } ] ) => ! removed )
				.map( ( [ uuid ] ) => uuid );
			const newUuids = uuids.filter(
				( uuid ) => ! prevCartProductsOrderActiveUuids.includes( uuid )
			);

			for ( const uuid of newUuids ) {
				const info = newOrder.get( uuid );

				// product was already in our data, but removed
				if ( info ) {
					newOrder.set( uuid, { ...info, removed: false } );
					setRestorableProducts( ( prevRestorableProducts ) =>
						prevRestorableProducts.filter( ( product ) => product.uuid !== uuid )
					);
				} else {
					newOrder.set( uuid, {
						position: newOrder.size,
						removed: false,
					} );
				}
			}

			return newOrder;
		} );
	}, [ responseCart.products, restorableProducts, setCartProductsOrder, setRestorableProducts ] );

	// Keep track of removed/restored products
	useEffect( () => {
		setCartProductsOrder( ( prevCartProductsOrder ) => {
			const newOrder = new Map( prevCartProductsOrder );

			newOrder.forEach( ( info, uuid ) => {
				const isRemoved = restorableProducts.some( ( product ) => product.uuid === uuid );

				newOrder.set( uuid, { ...info, removed: isRemoved } );
			} );
			return newOrder;
		} );
	}, [ restorableProducts, setCartProductsOrder ] );

	const hasWPCOMPlanInCart = responseCart.products.some( ( product ) =>
		isWpComPlan( product.product_slug )
	);

	const [ variantOpenId, setVariantOpenId ] = useState< string | null >( null );
	const [ akQuantityOpenId, setAkQuantityOpenId ] = useState< string | null >( null );

	const handleVariantToggle = useCallback(
		( id: string | null ) => {
			if ( isAkismetProMultipleLicensesCart ) {
				// Close Akismet quantity dropdown if it's open.
				if ( akQuantityOpenId === id ) {
					setAkQuantityOpenId( null );
				}
			}

			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_variant_dropdown_open', {
					has_wpcom_plan_in_cart: hasWPCOMPlanInCart,
				} )
			);
			setVariantOpenId( variantOpenId !== id ? id : null );
		},
		[
			akQuantityOpenId,
			hasWPCOMPlanInCart,
			isAkismetProMultipleLicensesCart,
			reduxDispatch,
			variantOpenId,
		]
	);

	const handleAkQuantityToggle = useCallback(
		( id: string | null ) => {
			// Close Variant picker if it's open.
			if ( variantOpenId === id ) {
				setVariantOpenId( null );
			}
			setAkQuantityOpenId( akQuantityOpenId !== id ? id : null );
		},
		[ akQuantityOpenId, variantOpenId ]
	);

	const changeAkismetPro500CartQuantity = useCallback< OnChangeAkProQuantity >(
		( uuid, productSlug, productId, prevQuantity, newQuantity ) => {
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_akismet_pro_quantity_change', {
					product_slug: productSlug,
					prev_quantity: prevQuantity,
					new_quantity: newQuantity,
				} )
			);
			replaceProductInCart( uuid, {
				product_slug: productSlug,
				product_id: productId,
				quantity: newQuantity,
			} ).catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
		},
		[ replaceProductInCart, reduxDispatch ]
	);

	const cartItems = responseCart.products.reduce< LineItemByProductUuid >( ( acc, product ) => {
		acc[ product.uuid ] = (
			<LineItemWrapper
				key={ product.uuid }
				product={ product }
				isSummary={ isSummary }
				removeProductFromCart={ removeProductFromCart }
				onChangeSelection={ onChangeSelection }
				createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
				responseCart={ responseCart }
				isPwpoUser={ isPwpoUser }
				onRemoveProduct={ onRemoveProduct }
				onRemoveProductClick={ onRemoveProductClick }
				onRemoveProductCancel={ onRemoveProductCancel }
				hasPartnerCoupon={ hasPartnerCoupon }
				isDisabled={ isDisabled }
				initialVariantTerm={
					initialProducts.find( ( initialProduct ) => {
						return initialProduct.product_variants.find(
							( variant ) => variant.product_id === product.product_id
						);
					} )?.months_per_bill_period
				}
				toggleVariantSelector={ handleVariantToggle }
				variantOpenId={ variantOpenId }
				isAkPro500Cart={ isAkismetProMultipleLicensesCart || forceShowAkQuantityDropdown }
				setForceShowAkQuantityDropdown={ setForceShowAkQuantityDropdown }
				onChangeAkProQuantity={ changeAkismetPro500CartQuantity }
				toggleAkQuantityDropdown={ handleAkQuantityToggle }
				akQuantityOpenId={ akQuantityOpenId }
			/>
		);

		return acc;
	}, {} );
	const restorableItems = restorableProducts.reduce< LineItemByProductUuid >( ( acc, product ) => {
		acc[ product.uuid ] = <RemovedFromCartItem key={ product.uuid } product={ product } />;

		return acc;
	}, {} );

	const orderedUuids = Array.from( cartProductsOrder.entries() ).sort(
		( [ , { position: posA } ], [ , { position: posB } ] ) => posA - posB
	);

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ orderedUuids.map( ( [ uuid ] ) => {
				const item = cartItems[ uuid ];
				if ( item ) {
					return item;
				}
				const restorableItem = restorableItems[ uuid ];
				if ( restorableItem ) {
					return restorableItem;
				}
				return null;
			} ) }
			{ couponLineItem && (
				<WPOrderReviewListItem key={ couponLineItem.id }>
					<CouponLineItem
						lineItem={ couponLineItem }
						isSummary={ isSummary }
						hasDeleteButton={ couponLineItem.hasDeleteButton }
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						isPwpoUser={ isPwpoUser }
						hasPartnerCoupon={ hasPartnerCoupon }
					/>
				</WPOrderReviewListItem>
			) }
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem
					subtotal
					lineItem={ creditsLineItem }
					isSummary={ isSummary }
					isPwpoUser={ isPwpoUser }
				/>
			) }
		</WPOrderReviewList>
	);
}

const DropdownWrapper = styled.span`
	width: 100%;
`;

function LineItemWrapper( {
	product,
	isSummary,
	removeProductFromCart,
	onChangeSelection,
	createUserAndSiteBeforeTransaction,
	responseCart,
	isPwpoUser,
	onRemoveProduct,
	onRemoveProductClick,
	onRemoveProductCancel,
	hasPartnerCoupon,
	isDisabled,
	initialVariantTerm,
	toggleVariantSelector,
	variantOpenId,
	isAkPro500Cart,
	setForceShowAkQuantityDropdown,
	onChangeAkProQuantity,
	toggleAkQuantityDropdown,
	akQuantityOpenId,
}: {
	product: ResponseCartProduct;
	isSummary?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	onChangeSelection?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
	hasPartnerCoupon: boolean;
	isDisabled: boolean;
	initialVariantTerm: number | null | undefined;
	toggleVariantSelector: ( key: string | null ) => void;
	variantOpenId: string | null;
	isAkPro500Cart: boolean;
	setForceShowAkQuantityDropdown: React.Dispatch< React.SetStateAction< boolean > >;
	onChangeAkProQuantity: OnChangeAkProQuantity;
	toggleAkQuantityDropdown: ( key: string | null ) => void;
	akQuantityOpenId: string | null;
} ) {
	const [ restorableProducts, setRestorableProducts ] = useRestorableProducts();
	const isRenewal = isWpComProductRenewal( product );
	const isWooMobile = isWcMobileApp();
	let isDeletable = canItemBeRemovedFromCart( product, responseCart ) && ! isWooMobile;
	const has100YearPlanProduct = has100YearPlan( responseCart );
	const signupFlowName = getSignupCompleteFlowName();
	const [ isStreamlinedPriceExperimentLoading, streamlinedPriceExperimentAssignment ] =
		useStreamlinedPriceExperiment();
	const isStreamlinedPrice =
		! isStreamlinedPriceExperimentLoading &&
		isStreamlinedPriceCheckoutTreatment( streamlinedPriceExperimentAssignment ) &&
		isWpComPlan( product.product_slug );

	if ( isCopySiteFlow( signupFlowName ) && ! product.is_domain_registration ) {
		isDeletable = false;
	}

	const isVariantDropdownOpen = product.uuid === variantOpenId;
	const isAkQuantityDropdownOpen = product.uuid === akQuantityOpenId;
	const variantDropdownRef = useRef< HTMLDivElement >( null );
	const akQuantityDropdownRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		const handleClickOutside =
			( ref: RefObject< HTMLDivElement >, toggle: ( key: string | null ) => void ) =>
			( event: MouseEvent ): void => {
				if ( ref.current && ! ref.current.contains( event.target as Node ) ) {
					toggle( null );
				}
			};

		const handleClickOutsideVariantDropdown = handleClickOutside(
			variantDropdownRef,
			toggleVariantSelector
		);

		const handleClickOutsideAkQuantityDropdown = handleClickOutside(
			akQuantityDropdownRef,
			toggleAkQuantityDropdown
		);

		if ( isVariantDropdownOpen ) {
			document.addEventListener( 'mousedown', handleClickOutsideVariantDropdown as EventListener );
		} else {
			document.removeEventListener( 'mousedown', handleClickOutsideVariantDropdown );
		}

		if ( isAkQuantityDropdownOpen ) {
			document.addEventListener( 'mousedown', handleClickOutsideAkQuantityDropdown );
		} else {
			document.removeEventListener( 'mousedown', handleClickOutsideAkQuantityDropdown );
		}

		return () => {
			document.removeEventListener( 'mousedown', handleClickOutsideVariantDropdown );
			document.removeEventListener( 'mousedown', handleClickOutsideAkQuantityDropdown );
		};
	}, [
		isVariantDropdownOpen,
		toggleVariantSelector,
		isAkQuantityDropdownOpen,
		toggleAkQuantityDropdown,
	] );

	const shouldShowVariantSelector = ( () => {
		if ( ! onChangeSelection ) {
			return false;
		}
		if ( isWooMobile ) {
			return false;
		}

		if ( isRenewal && ! product.is_domain_registration ) {
			return false;
		}

		if ( hasPartnerCoupon ) {
			return false;
		}

		if ( has100YearPlanProduct ) {
			return false;
		}
		if ( product.extra?.hideProductVariants ) {
			return false;
		}

		return true;
	} )();

	const isJetpack = responseCart.products.some( ( product ) =>
		isJetpackPurchasableItem( product.product_slug )
	);
	const variantsFilterCallback = ( variant: WPCOMProductVariant ) => {
		// Only show term variants which are equal to or longer than the variant that
		// was in the cart when checkout finished loading (not necessarily the
		// current variant). For WordPress.com only, not Jetpack, Akismet or Marketplace.
		// See https://github.com/Automattic/wp-calypso/issues/69633
		if ( ! initialVariantTerm ) {
			return true;
		}
		const isAkismet = isAkismetProduct( { product_slug: variant.productSlug } );
		const isMarketplace = product.extra?.is_marketplace_product;

		if ( isJetpack || isAkismet || isMarketplace ) {
			return true;
		}

		return variant.termIntervalInMonths >= initialVariantTerm;
	};
	const variants = useGetProductVariants(
		product,
		! isStreamlinedPrice ? variantsFilterCallback : undefined
	);

	const areThereVariants = variants.length > 1;

	const finalShouldShowVariantSelector =
		areThereVariants && shouldShowVariantSelector && onChangeSelection;

	const firstVariant = variants[ 0 ];
	const compareToPrice = firstVariant?.priceBeforeDiscounts / firstVariant?.termIntervalInMonths;

	return (
		<WPOrderReviewListItem key={ product.uuid }>
			<LineItem
				product={ product }
				hasDeleteButton={ isDeletable }
				removeProductFromCart={ removeProductFromCart }
				isRestorable
				isSummary={ isSummary }
				createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
				responseCart={ responseCart }
				restorableProducts={ restorableProducts }
				setRestorableProducts={ setRestorableProducts }
				isPwpoUser={ isPwpoUser }
				onRemoveProduct={ onRemoveProduct }
				onRemoveProductClick={ onRemoveProductClick }
				onRemoveProductCancel={ onRemoveProductCancel }
				isAkPro500Cart={ isAkPro500Cart }
				shouldShowBillingInterval={ ! finalShouldShowVariantSelector }
				shouldShowComparison={ isStreamlinedPrice }
				compareToPrice={ compareToPrice }
			>
				<DropdownWrapper
					className={ clsx( 'dropdown-wrapper', {
						'is-empty': ! finalShouldShowVariantSelector && ! ( ! isRenewal && isAkPro500Cart ),
					} ) }
				>
					{ finalShouldShowVariantSelector && (
						<div ref={ variantDropdownRef }>
							<ItemVariationPicker
								id={ product.uuid }
								selectedItem={ product }
								onChangeItemVariant={ onChangeSelection }
								isDisabled={ isDisabled }
								variants={ variants }
								toggle={ toggleVariantSelector }
								isOpen={ isVariantDropdownOpen }
							/>
						</div>
					) }
					{ ! isRenewal && isAkPro500Cart && (
						<div ref={ akQuantityDropdownRef }>
							<AkismetProQuantityDropDown
								id={ product.uuid }
								responseCart={ responseCart }
								setForceShowAkQuantityDropdown={ setForceShowAkQuantityDropdown }
								onChangeAkProQuantity={ onChangeAkProQuantity }
								toggle={ toggleAkQuantityDropdown }
								isOpen={ isAkQuantityDropdownOpen }
							/>
						</div>
					) }
				</DropdownWrapper>
			</LineItem>
		</WPOrderReviewListItem>
	);
}
