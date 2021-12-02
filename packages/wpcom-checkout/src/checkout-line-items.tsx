import {
	TITAN_MAIL_MONTHLY_SLUG,
	isDomainRegistration,
	isPlan,
	isMonthlyProduct,
	isYearly,
	isBiennially,
	isP2Plus,
	isWpComPlan,
	isJetpackSearch,
	isGoogleWorkspaceProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isJetpackProductSlug,
	isTitanMail,
} from '@automattic/calypso-products';
import { CheckoutModal, FormStatus, useFormStatus, Button } from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { getSublabel, getLabel } from './checkout-labels';
import { getIntroductoryOfferIntervalDisplay } from './get-introductory-offer-interval-display';
import { isWpComProductRenewal } from './is-wpcom-product-renewal';
import { joinClasses } from './join-classes';
import type { Theme, LineItem as LineItemType } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	RemoveProductFromCart,
	ResponseCartProduct,
} from '@automattic/shopping-cart';

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
	font-size: 14px;
	width: 100%;
`;

const DiscountCallout = styled.div< { theme?: Theme } >`
	color: ${ ( props ) => props.theme.colors.success };
	display: block;
	margin: 2px 0;
`;

const NotApplicableCallout = styled.div< { theme?: Theme } >`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	display: block;
	margin: 2px 0;
	font-size: 12px;
`;

const LineItemTitle = styled.div< { theme?: Theme; isSummary?: boolean } >`
	flex: 1;
	word-break: break-word;
	font-size: 16px;
`;

const LineItemPriceWrapper = styled.span< { theme?: Theme; isSummary?: boolean } >`
	margin-left: 12px;
	font-size: 16px;

	.rtl & {
		margin-right: 12px;
		margin-left: 0;
	}
`;

const DeleteButtonWrapper = styled.div`
	width: 100%;
	order: 1;
`;

const DeleteButton = styled( Button )< { theme?: Theme } >`
	display: inline-block;
	width: auto;
	font-size: 0.75rem;
	color: ${ ( props ) => props.theme.colors.textColorLight };
	margin-top: 4px;
`;

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

function WPNonProductLineItem( {
	lineItem,
	className = null,
	isSummary,
	hasDeleteButton,
	removeProductFromCart,
	createUserAndSiteBeforeTransaction,
	isPwpoUser,
}: {
	lineItem: LineItemType;
	className?: string | null;
	isSummary?: boolean;
	hasDeleteButton?: boolean;
	removeProductFromCart?: () => void;
	createUserAndSiteBeforeTransaction?: boolean;
	isPwpoUser?: boolean;
} ): JSX.Element {
	const id = lineItem.id;
	const itemSpanId = `checkout-line-item-${ id }`;
	const label = lineItem.label;
	const actualAmountDisplay = lineItem.amount.displayValue;
	const { formStatus } = useFormStatus();
	const isDisabled = formStatus !== FormStatus.READY;
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const translate = useTranslate();
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
			{ hasDeleteButton && removeProductFromCart && (
				<>
					<DeleteButtonWrapper>
						<DeleteButton
							className="checkout-line-item__remove-product"
							buttonType={ 'text-button' }
							aria-label={ String(
								translate( 'Remove %s from cart', {
									args: label,
								} )
							) }
							disabled={ isDisabled }
							onClick={ () => {
								setIsModalVisible( true );
							} }
						>
							{ translate( 'Remove from cart' ) }
						</DeleteButton>
					</DeleteButtonWrapper>

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

	if ( isJetpackSearch( product ) && product.current_quantity ) {
		const tierMaximum = product.price_tier_maximum_units;
		const tierMinimum = product.price_tier_minimum_units;
		if ( tierMaximum ) {
			return (
				<LineItemMeta>
					{ translate( 'Up to %(tierMaximum)s records', { args: { tierMaximum } } ) }
				</LineItemMeta>
			);
		}
		if ( tierMinimum ) {
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

	// This is the price for one item for products with a quantity (eg. seats in a license).
	const itemPrice = product.item_original_cost_for_quantity_one_display;

	if ( isPlan( product ) || isJetpackProductSlug( productSlug ) ) {
		if ( isP2Plus( product ) ) {
			const members = product?.current_quantity || 1;
			const p2Options = {
				args: {
					itemPrice,
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
		isGSuiteOrExtraLicenseProductSlug( productSlug ) ||
		isGoogleWorkspaceProductSlug( productSlug ) ||
		isTitanMail( product )
	) {
		let interval = null;

		if ( product.months_per_bill_period === 12 || product.months_per_bill_period === null ) {
			interval = translate( 'billed annually' );
		}

		if ( product.months_per_bill_period === 1 ) {
			interval = translate( 'billed monthly' );
		}

		if ( interval === null ) {
			return sublabel;
		}

		return (
			<>
				{ translate( '%(productType)s: %(interval)s', {
					args: {
						productType: sublabel,
						interval,
					},
					comment:
						"Product type and billing interval separated by a colon (e.g. 'Productivity Tools and Mailboxes: billed annually')",
				} ) }
			</>
		);
	}

	if ( ( isDomainRegistration || isDomainMap ) && product.months_per_bill_period === 12 ) {
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

	if ( product.introductory_offer_terms?.enabled ) {
		return null;
	}

	if (
		( ! isWpComPlan( planSlug ) && ! isJetpackProductSlug( planSlug ) ) ||
		origCost <= cost ||
		isRenewal ||
		isCouponApplied( product )
	) {
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
	if ( product.introductory_offer_terms?.reason ) {
		return (
			<NotApplicableCallout>
				{ translate( 'Order not eligible for introductory discount' ) }
			</NotApplicableCallout>
		);
	}
	if ( ! product.introductory_offer_terms?.enabled ) {
		return null;
	}
	const isFreeTrial = product.item_subtotal_integer === 0;
	const text = getIntroductoryOfferIntervalDisplay(
		translate,
		product.introductory_offer_terms.interval_unit,
		product.introductory_offer_terms.interval_count,
		isFreeTrial,
		'checkout',
		product.introductory_offer_terms.transition_after_renewal_count
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

	if (
		isGSuiteOrGoogleWorkspaceProductSlug( product.product_slug ) &&
		product.item_original_subtotal_integer < product.item_original_subtotal_integer &&
		product.is_sale_coupon_applied
	) {
		return <DiscountCallout>{ translate( 'Discount for first year' ) }</DiscountCallout>;
	}
	return null;
}

function WPLineItem( {
	children,
	product,
	className,
	hasDeleteButton,
	removeProductFromCart,
	isSummary,
	createUserAndSiteBeforeTransaction,
	responseCart,
	isPwpoUser,
	onRemoveProduct,
	onRemoveProductClick,
	onRemoveProductCancel,
}: {
	children?: React.ReactNode;
	product: ResponseCartProduct;
	className?: string;
	hasDeleteButton?: boolean;
	removeProductFromCart?: RemoveProductFromCart;
	isSummary?: boolean;
	createUserAndSiteBeforeTransaction?: boolean;
	responseCart: ResponseCart;
	isPwpoUser?: boolean;
	onRemoveProduct?: ( label: string ) => void;
	onRemoveProductClick?: ( label: string ) => void;
	onRemoveProductCancel?: ( label: string ) => void;
} ): JSX.Element {
	const id = product.uuid;
	const translate = useTranslate();
	const hasDomainsInCart = responseCart.products.some(
		( product ) => product.is_domain_registration || product.product_slug === 'domain_transfer'
	);
	const { formStatus } = useFormStatus();
	const itemSpanId = `checkout-line-item-${ id }`;
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const modalCopy = returnModalCopyForProduct(
		product,
		translate,
		hasDomainsInCart,
		createUserAndSiteBeforeTransaction || false,
		isPwpoUser || false
	);
	const isDisabled = formStatus !== FormStatus.READY;

	const isRenewal = isWpComProductRenewal( product );

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
			{ hasDeleteButton && removeProductFromCart && (
				<>
					<DeleteButtonWrapper>
						<DeleteButton
							className="checkout-line-item__remove-product"
							buttonType={ 'text-button' }
							aria-label={ String(
								translate( 'Remove %s from cart', {
									args: label,
								} )
							) }
							disabled={ isDisabled }
							onClick={ () => {
								setIsModalVisible( true );
								onRemoveProductClick?.( label );
							} }
						>
							{ translate( 'Remove from cart' ) }
						</DeleteButton>
					</DeleteButtonWrapper>

					<CheckoutModal
						isVisible={ isModalVisible }
						closeModal={ () => {
							setIsModalVisible( false );
						} }
						primaryAction={ () => {
							removeProductFromCart( product.uuid );
							onRemoveProduct?.( label );
						} }
						cancelAction={ () => {
							onRemoveProductCancel?.( label );
						} }
						title={ modalCopy.title }
						copy={ modalCopy.description }
					/>
				</>
			) }

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
			{ children }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
