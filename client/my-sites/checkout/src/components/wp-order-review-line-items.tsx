import { isAkismetProduct, isJetpackPurchasableItem } from '@automattic/calypso-products';
import { FormStatus, useFormStatus, Button } from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
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
	hasCheckoutVersion,
	doesPurchaseHaveFullCredits,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { has100YearPlan } from 'calypso/lib/cart-values/cart-items';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { useGetProductVariants } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { ItemVariationPicker } from './item-variation-picker';
import type { OnChangeItemVariant } from './item-variation-picker';
import type { Theme } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	RemoveProductFromCart,
	ResponseCartProduct,
	RemoveCouponFromCart,
} from '@automattic/shopping-cart';
import type { PropsWithChildren } from 'react';

const WPOrderReviewList = styled.ul< { theme?: Theme } >`
	box-sizing: border-box;
	margin: 24px 0;
	padding: 0;
`;

const WPOrderReviewListItem = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

const CostOverridesListStyle = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	font-size: 12px;
	font-weight: 400;
	margin-top: 10px;

	& .cost-overrides-list-item {
		display: grid;
		justify-content: space-between;
		grid-template-columns: auto auto;
		margin-top: 4px;
	}

	& .cost-overrides-list-item--coupon {
		margin-top: 16px;
	}

	& .cost-overrides-list-item:nth-of-type( 1 ) {
		margin-top: 0;
	}

	& .cost-overrides-list-item__actions {
		grid-column: 1 / span 2;
		display: flex;
		justify-content: flex-end;
	}

	& .cost-overrides-list-item__actions-remove {
		color: #787c82;
	}

	& .cost-overrides-list-item__reason {
		color: #008a20;
	}

	& .cost-overrides-list-item__discount {
		white-space: nowrap;
	}
`;

interface CostOverrideForDisplay {
	humanReadableReason: string;
	overrideCode: string;
	discountAmount: number;
}

function filterAndGroupCostOverridesForDisplay(
	responseCart: ResponseCart
): CostOverrideForDisplay[] {
	// Collect cost overrides from each line item and group them by type so we
	// can show them all together after the line item list.
	const costOverridesGrouped = responseCart.products.reduce<
		Record< string, CostOverrideForDisplay >
	>( ( grouped, product ) => {
		const costOverrides = product?.cost_overrides;
		if ( ! costOverrides ) {
			return grouped;
		}

		costOverrides.forEach( ( costOverride ) => {
			if ( costOverride.does_override_original_cost ) {
				// We won't display original cost overrides since they are
				// included in the original cost that's being displayed. They
				// are not discounts.
				return;
			}
			const discountAmount = grouped[ costOverride.override_code ]?.discountAmount ?? 0;
			const newDiscountAmount = costOverride.old_price - costOverride.new_price;
			grouped[ costOverride.override_code ] = {
				humanReadableReason: costOverride.human_readable_reason,
				overrideCode: costOverride.override_code,
				discountAmount: discountAmount + newDiscountAmount,
			};
		} );
		return grouped;
	}, {} );
	return Object.values( costOverridesGrouped );
}

const DeleteButton = styled( Button )< { theme?: Theme } >`
	width: auto;
	font-size: ${ hasCheckoutVersion( '2' ) ? '14px' : 'inherit' };
	color: ${ ( props ) => props.theme.colors.textColorLight };
`;

function CostOverridesList( {
	costOverridesList,
	currency,
	removeCoupon,
	couponCode,
	creditsInteger,
}: {
	costOverridesList: Array< CostOverrideForDisplay >;
	currency: string;
	removeCoupon: RemoveCouponFromCart;
	couponCode: ResponseCart[ 'coupon' ];
	creditsInteger: number;
} ) {
	const translate = useTranslate();
	// Let's put the coupon code last because it will have its own "Remove" button.
	const nonCouponOverrides = costOverridesList.filter(
		( override ) => override.overrideCode !== 'coupon-discount'
	);
	const couponOverrides = costOverridesList.filter(
		( override ) => override.overrideCode === 'coupon-discount'
	);
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	return (
		<>
			{ nonCouponOverrides.map( ( costOverride ) => {
				return (
					<div className="cost-overrides-list-item" key={ costOverride.humanReadableReason }>
						<span className="cost-overrides-list-item__reason">
							{ costOverride.humanReadableReason }
						</span>
						<span className="cost-overrides-list-item__discount">
							{ formatCurrency( -costOverride.discountAmount, currency ) }
						</span>
					</div>
				);
			} ) }
			{ creditsInteger > 0 && (
				<div className="cost-overrides-list-item" key="credits-override">
					<span className="cost-overrides-list-item__reason">{ translate( 'Credits' ) }</span>
					<span className="cost-overrides-list-item__discount">
						{ formatCurrency( -creditsInteger, currency, { isSmallestUnit: true } ) }
					</span>
				</div>
			) }
			{ couponOverrides.map( ( costOverride ) => {
				return (
					<div
						className="cost-overrides-list-item cost-overrides-list-item--coupon"
						key={ costOverride.humanReadableReason }
					>
						<span className="cost-overrides-list-item__reason">
							{ couponCode.length > 0
								? translate( 'Coupon: %(couponCode)s', { args: { couponCode } } )
								: costOverride.humanReadableReason }
						</span>
						<span className="cost-overrides-list-item__discount">
							{ formatCurrency( -costOverride.discountAmount, currency ) }
						</span>
						<span className="cost-overrides-list-item__actions">
							<DeleteButton
								buttonType="text-button"
								disabled={ isDisabled }
								className="cost-overrides-list-item__actions-remove"
								onClick={ removeCoupon }
								aria-label={ translate( 'Remove coupon' ) }
							>
								{ translate( 'Remove' ) }
							</DeleteButton>
						</span>
					</div>
				);
			} ) }
		</>
	);
}

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
	removeCoupon: RemoveCouponFromCart;
	onChangeSelection?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
} ) {
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const hasPartnerCoupon = getPartnerCoupon( {
		coupon: responseCart.coupon,
	} );

	const [ initialProducts ] = useState( () => responseCart.products );

	const costOverridesList = filterAndGroupCostOverridesForDisplay( responseCart );
	const isFullCredits = doesPurchaseHaveFullCredits( responseCart );
	// Clamp the credits display value to the total
	const creditsForDisplay = isFullCredits
		? responseCart.sub_total_with_taxes_integer
		: responseCart.credits_integer;

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ responseCart.products.map( ( product ) => (
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
				/>
			) ) }
			{ ! hasCheckoutVersion( '2' ) && couponLineItem && (
				<WPOrderReviewListItem key={ couponLineItem.id }>
					<CouponLineItem
						lineItem={ couponLineItem }
						isSummary={ isSummary }
						hasDeleteButton
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						isPwpoUser={ isPwpoUser }
						hasPartnerCoupon={ hasPartnerCoupon }
					/>
				</WPOrderReviewListItem>
			) }
			{ ! hasCheckoutVersion( '2' ) && creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem
					subtotal
					lineItem={ creditsLineItem }
					isSummary={ isSummary }
					isPwpoUser={ isPwpoUser }
				/>
			) }
			{ hasCheckoutVersion( '2' ) && costOverridesList.length > 0 && (
				<CostOverridesListStyle>
					<CostOverridesList
						costOverridesList={ costOverridesList }
						currency={ responseCart.currency }
						removeCoupon={ removeCoupon }
						couponCode={ responseCart.coupon }
						creditsInteger={ creditsForDisplay }
					/>
				</CostOverridesListStyle>
			) }
		</WPOrderReviewList>
	);
}

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
} ) {
	const isRenewal = isWpComProductRenewal( product );
	const isWooMobile = isWcMobileApp();
	let isDeletable = canItemBeRemovedFromCart( product, responseCart ) && ! isWooMobile;
	const has100YearPlanProduct = has100YearPlan( responseCart );

	const signupFlowName = getSignupCompleteFlowName();
	if ( isCopySiteFlow( signupFlowName ) && ! product.is_domain_registration ) {
		isDeletable = false;
	}

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

		return true;
	} )();

	const isJetpack = responseCart.products.some( ( product ) =>
		isJetpackPurchasableItem( product.product_slug )
	);

	const variants = useGetProductVariants( product, ( variant ) => {
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
	} );

	const areThereVariants = variants.length > 1;

	return (
		<WPOrderReviewListItem key={ product.uuid }>
			<LineItem
				product={ product }
				hasDeleteButton={ isDeletable }
				removeProductFromCart={ removeProductFromCart }
				isSummary={ isSummary }
				createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
				responseCart={ responseCart }
				isPwpoUser={ isPwpoUser }
				onRemoveProduct={ onRemoveProduct }
				onRemoveProductClick={ onRemoveProductClick }
				onRemoveProductCancel={ onRemoveProductCancel }
			>
				{ areThereVariants && shouldShowVariantSelector && onChangeSelection && (
					<ItemVariationPicker
						selectedItem={ product }
						onChangeItemVariant={ onChangeSelection }
						isDisabled={ isDisabled }
						variants={ variants }
					/>
				) }
			</LineItem>
		</WPOrderReviewListItem>
	);
}
