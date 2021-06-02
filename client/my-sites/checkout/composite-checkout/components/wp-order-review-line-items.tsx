/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import {
	CheckoutModal,
	FormStatus,
	useFormStatus,
	useEvents,
	Button,
} from '@automattic/composite-checkout';
import type { Theme, LineItem as LineItemType } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';
import type {
	RemoveProductFromCart,
	ResponseCartProduct,
	RemoveCouponFromCart,
} from '@automattic/shopping-cart';
import {
	getCouponLineItemFromCart,
	getTaxLineItemFromCart,
	getCreditsLineItemFromCart,
	isWpComProductRenewal,
} from '@automattic/wpcom-checkout';
import {
	isDomainRegistration,
	isPlan,
	isMonthlyProduct,
	isYearly,
	isBiennially,
	isP2Plus,
	isWpComPlan,
	isJetpackSearch,
} from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import joinClasses from './join-classes';
import { ItemVariationPicker } from './item-variation-picker';
import {
	isGoogleWorkspaceProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from 'calypso/lib/gsuite';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import { getSublabel, getLabel } from '../lib/translate-cart';
import type {
	WPCOMProductSlug,
	WPCOMProductVariant,
	OnChangeItemVariant,
} from './item-variation-picker';
import { getIntroductoryOfferIntervalDisplay } from 'calypso/lib/purchases/utils';
import {
	getProductDisplayCost,
	getProductPriceTierList,
} from 'calypso/state/products-list/selectors';
import { getPriceTierForUnits } from 'calypso/my-sites/plans/jetpack-plans/utils';

import deleteIcon from './delete-icon.svg';

const WPOrderReviewList = styled.ul< { theme?: Theme } >`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	box-sizing: border-box;
	margin: 20px 36px 20px 0;
	padding: 0;

	.rtl & {
		margin: 20px 0 20px 36px;
	}
`;

const WPOrderReviewListItem = styled.li`
	margin: 0;
	padding: 0;
	display: block;
	list-style: none;
`;

export const NonProductLineItem = styled( WPNonProductLineItem )< {
	theme?: Theme;
	total?: boolean;
	tax?: boolean;
	coupon?: boolean;
	subtotal?: boolean;
} >`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	font-weight: ${ ( { theme, total } ) => ( total ? theme.weights.bold : theme.weights.normal ) };
	color: ${ ( { theme, total } ) =>
		total ? theme.colors.textColorDark : theme.colors.textColor };
	font-size: ${ ( { total } ) => ( total ? '1.2em' : '1.1em' ) };
	padding: ${ ( { total, tax, subtotal, coupon } ) =>
		total || subtotal || tax || coupon ? '10px 0' : '20px 0' };
	border-bottom: ${ ( { theme, total } ) =>
		total ? 0 : '1px solid ' + theme.colors.borderColorLight };
	position: relative;

	.checkout-line-item__price {
		position: relative;
	}
`;

export const LineItem = styled( WPLineItem )< {
	theme?: Theme;
} >`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	font-weight: ${ ( { theme } ) => theme.weights.normal };
	color: ${ ( { theme } ) => theme.colors.textColor };
	font-size: 1.1em;
	padding: 20px 0;
	border-bottom: ${ ( { theme } ) => '1px solid ' + theme.colors.borderColorLight };
	position: relative;

	.checkout-line-item__price {
		position: relative;
	}
`;

const LineItemMeta = styled.div< { theme?: Theme } >`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	display: flex;
	font-size: 14px;
	justify-content: space-between;
	width: 100%;
`;

const DiscountCallout = styled.div< { theme?: Theme } >`
	color: ${ ( props ) => props.theme.colors.success };
	text-align: right;

	.rtl & {
		text-align: left;
	}
`;

const LineItemTitle = styled.div< { theme?: Theme; isSummary?: boolean } >`
	flex: 1;
	word-break: break-word;
	font-size: ${ ( { isSummary } ) => ( isSummary ? '14px' : '16px' ) };
`;

const LineItemPriceWrapper = styled.span< { theme?: Theme; isSummary?: boolean } >`
	margin-left: 12px;
	font-size: ${ ( { isSummary } ) => ( isSummary ? '14px' : '16px' ) };

	.rtl & {
		margin-right: 12px;
		margin-left: 0;
	}
`;

const DeleteButton = styled( Button )< { theme?: Theme; coupon?: boolean } >`
	position: absolute;
	padding: 10px;
	right: -50px;
	top: ${ ( props ) => ( props.coupon ? '0px' : '7px' ) };

	:hover rect {
		fill: ${ ( props ) => props.theme.colors.error };
	}

	svg {
		opacity: 1;
	}

	.rtl & {
		right: auto;
		left: -50px;
	}
`;

export function WPOrderReviewSection( {
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
} ): JSX.Element {
	return <div className={ joinClasses( [ className, 'order-review-section' ] ) }>{ children }</div>;
}
function LineItemPrice( {
	isDiscounted,
	actualAmount,
	originalAmount,
	isSummary,
}: {
	isDiscounted?: boolean;
	actualAmount: string;
	originalAmount?: string;
	isSummary?: boolean;
} ) {
	return (
		<LineItemPriceWrapper isSummary={ isSummary }>
			{ isDiscounted && originalAmount ? (
				<>
					<s>{ originalAmount }</s> { actualAmount }
				</>
			) : (
				actualAmount
			) }
		</LineItemPriceWrapper>
	);
}

function DeleteIcon( { uniqueID, product }: { uniqueID: string; product: string } ) {
	const translate = useTranslate();
	const text = String(
		translate( 'Remove %s from cart', {
			args: product,
		} )
	);
	return <img id={ uniqueID } alt={ text } src={ deleteIcon } />;
}

export function WPNonProductLineItem( {
	lineItem,
	coupon,
	className = null,
	isSummary,
	hasDeleteButton,
	removeProductFromCart,
	createUserAndSiteBeforeTransaction,
}: {
	lineItem: LineItemType;
	coupon?: boolean;
	className?: string | null;
	isSummary?: boolean;
	hasDeleteButton?: boolean;
	removeProductFromCart?: () => void;
	createUserAndSiteBeforeTransaction?: boolean;
} ): JSX.Element {
	const id = lineItem.id;
	const itemSpanId = `checkout-line-item-${ id }`;
	const label = lineItem.label;
	const actualAmountDisplay = lineItem.amount.displayValue;
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const deleteButtonId = `checkout-delete-button-${ id }`;
	const translate = useTranslate();
	const isPwpoUser = useSelector(
		( state ) =>
			getCurrentUser( state ) && currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
	);
	const modalCopy = returnModalCopy(
		lineItem.type,
		translate,
		createUserAndSiteBeforeTransaction || false,
		isPwpoUser || false
	);

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className={ joinClasses( [ className, 'checkout-line-item' ] ) }
			data-e2e-product-slug={ lineItem.id }
			data-product-type={ lineItem.type }
		>
			<LineItemTitle id={ itemSpanId } isSummary={ isSummary }>
				{ label }
			</LineItemTitle>
			<span aria-labelledby={ itemSpanId } className="checkout-line-item__price">
				<LineItemPrice actualAmount={ actualAmountDisplay } isSummary={ isSummary } />
			</span>
			{ hasDeleteButton && removeProductFromCart && formStatus === FormStatus.READY && (
				<>
					<DeleteButton
						coupon={ coupon }
						className="checkout-line-item__remove-product"
						buttonType="borderless"
						disabled={ isDisabled }
						onClick={ () => {
							setIsModalVisible( true );
						} }
					>
						<DeleteIcon uniqueID={ deleteButtonId } product={ label } />
					</DeleteButton>

					<CheckoutModal
						isVisible={ isModalVisible }
						closeModal={ () => {
							setIsModalVisible( false );
						} }
						primaryAction={ () => {
							removeProductFromCart();
						} }
						title={ modalCopy.title }
						copy={ modalCopy.description }
					/>
				</>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export function WPOrderReviewLineItems( {
	className,
	isSummary,
	removeProductFromCart,
	removeCoupon,
	getItemVariants,
	onChangePlanLength,
	createUserAndSiteBeforeTransaction,
}: {
	className?: string;
	isSummary?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	removeCoupon: RemoveCouponFromCart;
	getItemVariants?: ( productSlug: WPCOMProductSlug ) => WPCOMProductVariant[];
	onChangePlanLength?: OnChangeItemVariant;
	createUserAndSiteBeforeTransaction?: boolean;
} ): JSX.Element {
	const { responseCart } = useShoppingCart();
	const taxLineItem = getTaxLineItemFromCart( responseCart );
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const couponLineItem = getCouponLineItemFromCart( responseCart );

	return (
		<WPOrderReviewList className={ joinClasses( [ className, 'order-review-line-items' ] ) }>
			{ responseCart.products.map( ( product ) => {
				return (
					<WPOrderReviewListItem key={ product.uuid }>
						<LineItem
							product={ product }
							hasDeleteButton={ canItemBeDeleted( product ) }
							removeProductFromCart={ removeProductFromCart }
							getItemVariants={ getItemVariants }
							onChangePlanLength={ onChangePlanLength }
							isSummary={ isSummary }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						/>
					</WPOrderReviewListItem>
				);
			} ) }
			{ taxLineItem && ! isSummary && (
				<WPOrderReviewListItem key={ taxLineItem.id }>
					<NonProductLineItem tax lineItem={ taxLineItem } isSummary={ isSummary } />
				</WPOrderReviewListItem>
			) }
			{ couponLineItem && (
				<WPOrderReviewListItem key={ couponLineItem.id }>
					<NonProductLineItem
						coupon
						lineItem={ couponLineItem }
						isSummary={ isSummary }
						hasDeleteButton={ ! isSummary }
						removeProductFromCart={ removeCoupon }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					/>
				</WPOrderReviewListItem>
			) }
			{ creditsLineItem && responseCart.sub_total_integer > 0 && (
				<NonProductLineItem subtotal lineItem={ creditsLineItem } isSummary={ isSummary } />
			) }
		</WPOrderReviewList>
	);
}

WPOrderReviewLineItems.propTypes = {
	className: PropTypes.string,
	isSummary: PropTypes.bool,
	removeProductFromCart: PropTypes.func,
	removeCoupon: PropTypes.func,
	getItemVariants: PropTypes.func,
	onChangePlanLength: PropTypes.func,
};

function GSuiteUsersList( { product }: { product: ResponseCartProduct } ) {
	const users = product.extra?.google_apps_users ?? [];
	return (
		<>
			{ users.map( ( user, index ) => {
				return (
					<LineItemMeta key={ user.email }>
						<div key={ user.email }>{ user.email }</div>
						{ index === 0 && <GSuiteDiscountCallout product={ product } /> }
					</LineItemMeta>
				);
			} ) }
		</>
	);
}

function TitanMailMeta( {
	product,
	isRenewal,
}: {
	product: ResponseCartProduct;
	isRenewal: boolean;
} ) {
	const translate = useTranslate();
	const quantity = product.extra?.new_quantity ?? 1;
	const domainName = product.meta;
	const translateArgs = {
		args: {
			numberOfMailboxes: quantity,
			domainName,
		},
		count: quantity,
	};
	return (
		<LineItemMeta>
			{ isRenewal
				? translate(
						'%(numberOfMailboxes)d mailbox for %(domainName)s',
						'%(numberOfMailboxes)d mailboxes for %(domainName)s',
						translateArgs
				  )
				: translate(
						'%(numberOfMailboxes)d new mailbox for %(domainName)s',
						'%(numberOfMailboxes)d new mailboxes for %(domainName)s',
						translateArgs
				  ) }
		</LineItemMeta>
	);
}

interface ModalCopy {
	title: string;
	description: string;
}

function returnModalCopyForProduct(
	product: ResponseCartProduct,
	translate: ReturnType< typeof useTranslate >,
	hasDomainsInCart: boolean,
	createUserAndSiteBeforeTransaction: boolean,
	isPwpoUser: boolean
): ModalCopy {
	const productType = getProductTypeForModalCopy( product, hasDomainsInCart );
	const isRenewal = isWpComProductRenewal( product );
	return returnModalCopy(
		productType,
		translate,
		createUserAndSiteBeforeTransaction,
		isPwpoUser,
		isRenewal
	);
}

function getProductTypeForModalCopy(
	product: ResponseCartProduct,
	hasDomainsInCart: boolean
): string {
	if ( isPlan( product ) ) {
		if ( hasDomainsInCart ) {
			return 'plan with dependencies';
		}
		return 'plan';
	}

	if ( isDomainRegistration( product ) ) {
		return 'domain';
	}

	return product.product_slug;
}

function returnModalCopy(
	productType: string,
	translate: ReturnType< typeof useTranslate >,
	createUserAndSiteBeforeTransaction: boolean,
	isPwpoUser: boolean,
	isRenewal = false
): ModalCopy {
	switch ( productType ) {
		case 'plan with dependencies': {
			if ( isRenewal ) {
				return {
					title: String( translate( 'You are about to remove your plan renewal from the cart' ) ),
					description: String(
						translate(
							'When you press Continue, we will remove your plan renewal from the cart and your plan will keep its current expiry date.'
						)
					),
				};
			}
			const title = String( translate( 'You are about to remove your plan from the cart' ) );
			let description = '';

			if ( createUserAndSiteBeforeTransaction ) {
				description = String(
					translate(
						'When you press Continue, we will remove your plan from the cart. Your site will be created on the free plan when you complete payment for the other product(s) in your cart.'
					)
				);
			} else {
				description = String(
					isPwpoUser
						? translate(
								'When you press Continue, we will remove your plan from the cart and your site will continue to run with its current plan.'
						  )
						: translate(
								'When you press Continue, we will remove your plan from the cart and your site will continue to run with its current plan. Since your other product(s) depend on your plan to be purchased, they will also be removed from the cart and we will take you back to your site.'
						  )
				);
			}
			return { title, description };
		}
		case 'plan':
			if ( isRenewal ) {
				return {
					title: String( translate( 'You are about to remove your plan renewal from the cart' ) ),
					description: String(
						translate(
							'When you press Continue, we will remove your plan renewal from the cart and your plan will keep its current expiry date. We will then take you back to your site.'
						)
					),
				};
			}

			return {
				title: String( translate( 'You are about to remove your plan from the cart' ) ),
				description: String(
					createUserAndSiteBeforeTransaction
						? translate( 'When you press Continue, we will remove your plan from the cart.' )
						: translate(
								'When you press Continue, we will remove your plan from the cart and your site will continue to run with its current plan. We will then take you back to your site.'
						  )
				),
			};
		case 'domain':
			if ( isRenewal ) {
				return {
					title: String( translate( 'You are about to remove your domain renewal from the cart' ) ),
					description: String(
						translate(
							'When you press Continue, we will remove your domain renewal from the cart and your domain will keep its current expiry date.'
						)
					),
				};
			}

			return {
				title: String( translate( 'You are about to remove your domain from the cart' ) ),
				description: String(
					translate(
						'When you press Continue, we will remove your domain from the cart and you will have no claim for the domain name you picked.'
					)
				),
			};
		case 'coupon':
			return {
				title: String( translate( 'You are about to remove your coupon from the cart' ) ),
				description: String(
					translate( 'When you press Continue, we will need you to confirm your payment details.' )
				),
			};
		default:
			if ( isRenewal ) {
				return {
					title: String( translate( 'You are about to remove your renewal from the cart' ) ),
					description: String(
						translate(
							'When you press Continue, we will remove your renewal from the cart and your product will keep its current expiry date.'
						)
					),
				};
			}

			return {
				title: String( translate( 'You are about to remove your product from the cart' ) ),
				description: String(
					createUserAndSiteBeforeTransaction
						? translate( 'When you press Continue, we will remove your product from the cart.' )
						: translate(
								'When you press Continue, we will remove your product from the cart and your site will continue to run without it.'
						  )
				),
			};
	}
}

function canItemBeDeleted( item: ResponseCartProduct ): boolean {
	const itemTypesThatCannotBeDeleted = [ 'domain_redemption' ];
	return ! itemTypesThatCannotBeDeleted.includes( item.product_slug );
}

function JetpackSearchMeta( { product }: { product: ResponseCartProduct } ): JSX.Element {
	return (
		<>
			<ProductTier product={ product } />
			<RenewalFrequency product={ product } />
		</>
	);
}

function ProductTier( { product }: { product: ResponseCartProduct } ): JSX.Element | null {
	const translate = useTranslate();
	const priceTierList = useSelector( ( state ) =>
		getProductPriceTierList( state, product.product_slug )
	);

	if ( isJetpackSearch( product ) && product.current_quantity ) {
		const tier = getPriceTierForUnits( priceTierList, product.current_quantity );
		const tierMaximum = tier?.maximum_units;
		const tierMinimum = tier?.minimum_units;
		if ( tierMaximum ) {
			return (
				<LineItemMeta>
					{ translate( 'Up to %(tierMaximum)s records', { args: { tierMaximum } } ) }
				</LineItemMeta>
			);
		}
		if ( tier && ! tierMaximum ) {
			return (
				<LineItemMeta>
					{ translate( 'More than %(tierMinimum) records', { args: { tierMinimum } } ) }
				</LineItemMeta>
			);
		}
	}
	return null;
}

function RenewalFrequency( { product }: { product: ResponseCartProduct } ): JSX.Element | null {
	const translate = useTranslate();
	if ( isMonthlyProduct( product ) ) {
		return <LineItemMeta>{ translate( 'Renews monthly' ) }</LineItemMeta>;
	}

	if ( isYearly( product ) ) {
		return <LineItemMeta>{ translate( 'Renews annually' ) }</LineItemMeta>;
	}

	if ( isBiennially( product ) ) {
		return <LineItemMeta>{ translate( 'Renews every two years' ) }</LineItemMeta>;
	}
	return null;
}

function LineItemSublabelAndPrice( {
	product,
}: {
	product: ResponseCartProduct;
} ): JSX.Element | null {
	const translate = useTranslate();
	const isDomainRegistration = product.is_domain_registration;
	const isDomainMap = product.product_slug === 'domain_map';
	const productSlug = product.product_slug;
	const sublabel = getSublabel( product );

	const isGSuite =
		isGSuiteOrExtraLicenseProductSlug( productSlug ) || isGoogleWorkspaceProductSlug( productSlug );
	// This is the price for one item for products with a quantity (eg. seats in a license).
	const itemPrice = useSelector( ( state ) => getProductDisplayCost( state, productSlug ) );

	if ( isPlan( product ) ) {
		if ( isP2Plus( product ) ) {
			const members = product?.current_quantity || 1;
			const p2Options = {
				args: {
					itemPrice: itemPrice,
					members,
				},
				count: members,
			};
			return (
				<>
					{ translate(
						'Monthly subscription: %(itemPrice)s x %(members)s active member',
						'Monthly subscription: %(itemPrice)s x %(members)s active members',
						p2Options
					) }
				</>
			);
		}

		const options = {
			args: {
				sublabel,
				price: product.item_original_subtotal_display,
			},
		};

		if ( isMonthlyProduct( product ) ) {
			return <>{ translate( '%(sublabel)s: %(price)s per month', options ) }</>;
		}

		if ( isYearly( product ) ) {
			return <>{ translate( '%(sublabel)s: %(price)s per year', options ) }</>;
		}

		if ( isBiennially( product ) ) {
			return <>{ translate( '%(sublabel)s: %(price)s per two years', options ) }</>;
		}
	}

	if (
		( isDomainRegistration || isDomainMap || isGSuite ) &&
		product.months_per_bill_period === 12
	) {
		const premiumLabel = product.extra?.premium ? translate( 'Premium' ) : null;
		return (
			<>
				{ translate( '%(premiumLabel)s %(sublabel)s: %(interval)s', {
					args: {
						premiumLabel,
						sublabel: sublabel,
						interval: translate( 'billed annually' ),
					},
					comment:
						'premium label, product type and billing interval, separated by a colon. ex: ".blog domain registration: billed annually" or "Premium .blog domain registration: billed annually"',
				} ) }
			</>
		);
	}
	return <>{ sublabel || null }</>;
}

function isCouponApplied( { coupon_savings_integer = 0 }: ResponseCartProduct ) {
	return coupon_savings_integer > 0;
}

function FirstTermDiscountCallout( {
	product,
}: {
	product: ResponseCartProduct;
} ): JSX.Element | null {
	const translate = useTranslate();
	const planSlug = product.product_slug;
	const origCost = product.item_original_cost_integer;
	const cost = product.product_cost_integer;
	const isRenewal = product.is_renewal;

	if ( ! isWpComPlan( planSlug ) || origCost <= cost || isRenewal || isCouponApplied( product ) ) {
		return null;
	}

	if ( isMonthlyProduct( product ) ) {
		return <DiscountCallout>{ translate( 'Discount for first month' ) }</DiscountCallout>;
	}

	if ( isYearly( product ) ) {
		return <DiscountCallout>{ translate( 'Discount for first year' ) }</DiscountCallout>;
	}

	if ( isBiennially( product ) ) {
		return <DiscountCallout>{ translate( 'Discount for first term' ) }</DiscountCallout>;
	}

	return null;
}

function IntroductoryOfferCallout( {
	product,
}: {
	product: ResponseCartProduct;
} ): JSX.Element | null {
	const translate = useTranslate();
	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}
	const isFreeTrial = product.item_subtotal_integer === 0;
	const text = getIntroductoryOfferIntervalDisplay(
		translate,
		product.introductory_offer_terms.interval_unit,
		product.introductory_offer_terms.interval_count,
		isFreeTrial
	);
	return <DiscountCallout>{ text }</DiscountCallout>;
}

function DomainDiscountCallout( {
	product,
}: {
	product: ResponseCartProduct;
} ): JSX.Element | null {
	const translate = useTranslate();

	const isFreeBundledDomainRegistration = product.is_bundled && product.item_subtotal_integer === 0;
	if ( isFreeBundledDomainRegistration ) {
		return <DiscountCallout>{ translate( 'Discount for first year' ) }</DiscountCallout>;
	}

	const isFreeDomainMapping =
		product.product_slug === 'domain_map' && product.item_subtotal_integer === 0;
	if ( isFreeDomainMapping ) {
		return <DiscountCallout>{ translate( 'Free with your plan' ) }</DiscountCallout>;
	}

	return null;
}

function CouponDiscountCallout( {
	product,
}: {
	product: ResponseCartProduct;
} ): JSX.Element | null {
	const translate = useTranslate();

	if ( isCouponApplied( product ) ) {
		return <DiscountCallout>{ translate( 'Discounts applied' ) }</DiscountCallout>;
	}

	return null;
}

function GSuiteDiscountCallout( {
	product,
}: {
	product: ResponseCartProduct;
} ): JSX.Element | null {
	const translate = useTranslate();

	const isGSuite = isGSuiteOrGoogleWorkspaceProductSlug( product.product_slug );

	if (
		isGSuite &&
		product.item_original_subtotal_integer < product.item_original_subtotal_integer &&
		product.is_sale_coupon_applied
	) {
		return <DiscountCallout>{ translate( 'Discount for first year' ) }</DiscountCallout>;
	}
	return null;
}

function WPLineItem( {
	product,
	className,
	hasDeleteButton,
	removeProductFromCart,
	getItemVariants,
	onChangePlanLength,
	isSummary,
	createUserAndSiteBeforeTransaction,
}: {
	product: ResponseCartProduct;
	className?: string;
	hasDeleteButton?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	getItemVariants?: ( productSlug: WPCOMProductSlug ) => WPCOMProductVariant[];
	onChangePlanLength?: OnChangeItemVariant;
	isSummary?: boolean;
	createUserAndSiteBeforeTransaction?: boolean;
} ): JSX.Element {
	const id = product.uuid;
	const translate = useTranslate();
	const { responseCart } = useShoppingCart();
	const hasDomainsInCart = responseCart.products.some(
		( product ) => product.is_domain_registration || product.product_slug === 'domain_transfer'
	);
	const { formStatus } = useFormStatus();
	const itemSpanId = `checkout-line-item-${ id }`;
	const deleteButtonId = `checkout-delete-button-${ id }-${ isSummary ? 'summary' : 'edit' }`;
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const isPwpoUser = useSelector(
		( state ) =>
			getCurrentUser( state ) && currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
	);
	const modalCopy = returnModalCopyForProduct(
		product,
		translate,
		hasDomainsInCart,
		createUserAndSiteBeforeTransaction || false,
		isPwpoUser || false
	);
	const onEvent = useEvents();
	const isDisabled = formStatus !== FormStatus.READY;

	const isRenewal = isWpComProductRenewal( product );
	// Show the variation picker when this is not a renewal
	const shouldShowVariantSelector = getItemVariants && product && ! isRenewal;

	const productSlug = product?.product_slug;

	const isGSuite =
		isGSuiteOrExtraLicenseProductSlug( productSlug ) || isGoogleWorkspaceProductSlug( productSlug );

	const isTitanMail = productSlug === TITAN_MAIL_MONTHLY_SLUG;

	const sublabel = getSublabel( product );
	const label = getLabel( product );

	const originalAmountDisplay = product.item_original_subtotal_display;
	const originalAmountInteger = product.item_original_subtotal_integer;

	const actualAmountDisplay = product.item_subtotal_display;
	const isDiscounted = Boolean(
		product.item_subtotal_integer < originalAmountInteger && originalAmountDisplay
	);

	const deleteButtonText = String(
		translate( 'Remove %s from cart', {
			args: label,
		} )
	);

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className={ joinClasses( [ className, 'checkout-line-item' ] ) }
			data-e2e-product-slug={ productSlug }
			data-product-type={ isPlan( product ) ? 'plan' : product.product_slug }
		>
			<LineItemTitle id={ itemSpanId } isSummary={ isSummary }>
				{ label }
			</LineItemTitle>
			<span aria-labelledby={ itemSpanId } className="checkout-line-item__price">
				<LineItemPrice
					isDiscounted={ isDiscounted }
					actualAmount={ actualAmountDisplay }
					originalAmount={ originalAmountDisplay }
					isSummary={ isSummary }
				/>
			</span>
			{ sublabel && (
				<LineItemMeta>
					<LineItemSublabelAndPrice product={ product } />
					<DomainDiscountCallout product={ product } />
					<FirstTermDiscountCallout product={ product } />
					<CouponDiscountCallout product={ product } />
					<IntroductoryOfferCallout product={ product } />
				</LineItemMeta>
			) }
			{ isJetpackSearch( product ) && <JetpackSearchMeta product={ product } /> }
			{ isGSuite && <GSuiteUsersList product={ product } /> }
			{ isTitanMail && <TitanMailMeta product={ product } isRenewal={ isRenewal } /> }
			{ hasDeleteButton && removeProductFromCart && formStatus === FormStatus.READY && (
				<>
					<DeleteButton
						className="checkout-line-item__remove-product"
						aria-label={ deleteButtonText }
						buttonType="borderless"
						disabled={ isDisabled }
						onClick={ () => {
							setIsModalVisible( true );
							onEvent( {
								type: 'a8c_checkout_delete_product_press',
								payload: {
									product_name: label,
								},
							} );
						} }
					>
						<DeleteIcon uniqueID={ deleteButtonId } product={ label } />
					</DeleteButton>

					<CheckoutModal
						isVisible={ isModalVisible }
						closeModal={ () => {
							setIsModalVisible( false );
						} }
						primaryAction={ () => {
							removeProductFromCart( product.uuid );
							onEvent( {
								type: 'a8c_checkout_delete_product',
								payload: {
									product_name: label,
								},
							} );
						} }
						cancelAction={ () => {
							onEvent( {
								type: 'a8c_checkout_cancel_delete_product',
							} );
						} }
						title={ modalCopy.title }
						copy={ modalCopy.description }
					/>
				</>
			) }

			{ shouldShowVariantSelector && getItemVariants && onChangePlanLength && (
				<ItemVariationPicker
					selectedItem={ product }
					getItemVariants={ getItemVariants }
					onChangeItemVariant={ onChangePlanLength }
					isDisabled={ isDisabled }
				/>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

WPLineItem.propTypes = {
	className: PropTypes.string,
	total: PropTypes.bool,
	tax: PropTypes.bool,
	subtotal: PropTypes.bool,
	isSummary: PropTypes.bool,
	hasDeleteButton: PropTypes.bool,
	removeProductFromCart: PropTypes.func,
	product: PropTypes.object.isRequired,
	getItemVariants: PropTypes.func,
	onChangePlanLength: PropTypes.func,
	createUserAndSiteBeforeTransaction: PropTypes.bool,
};
