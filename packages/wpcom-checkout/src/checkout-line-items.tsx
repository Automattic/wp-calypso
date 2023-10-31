import {
	isAddOn,
	isDomainRegistration,
	isPlan,
	isMonthlyProduct,
	isYearly,
	isBiennially,
	isTriennially,
	isP2Plus,
	isWpComPlan,
	isJetpackSearch,
	isGoogleWorkspaceProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
	isJetpackProductSlug,
	isTitanMail,
	isDIFMProduct,
	isTieredVolumeSpaceAddon,
} from '@automattic/calypso-products';
import { Gridicon, Popover } from '@automattic/components';
import {
	CheckoutModal,
	FormStatus,
	useFormStatus,
	Button,
	Theme,
} from '@automattic/composite-checkout';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState, PropsWithChildren, useRef } from 'react';
import { getLabel, DefaultLineItemSublabel } from './checkout-labels';
import { hasCheckoutVersion } from './checkout-version-checker';
import { getItemIntroductoryOfferDisplay } from './introductory-offer';
import { isWpComProductRenewal } from './is-wpcom-product-renewal';
import { joinClasses } from './join-classes';
import { getPartnerCoupon } from './partner-coupon';
import IonosLogo from './partner-logo-ionos';
import type { LineItemType } from './types';
import type {
	GSuiteProductUser,
	ResponseCart,
	RemoveProductFromCart,
	ResponseCartProduct,
	TitanProductUser,
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
		total ? theme.colors.textColorDark : theme.colors.textColorLight };
	font-size: ${ ( { total } ) => ( total ? '1.2em' : '1.1em' ) };
	line-height: 1em;
	padding: ${ ( { total, tax, subtotal, coupon } ) =>
		total || subtotal || tax || coupon ? '0' : '20px 0' };
	position: relative;
	margin-bottom: 8px;

	&:last-child {
		margin-bottom: 0;
	}

	.checkout-line-item__price {
		position: relative;
	}
`;

export const LineItem = styled( CheckoutLineItem )< {
	theme?: Theme;
} >`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	font-weight: ${ ( { theme } ) => theme.weights.normal };
	color: ${ ( { theme } ) => theme.colors.textColorDark };
	font-size: 1.1em;
	padding: ${ hasCheckoutVersion( '2' ) ? '10px' : '20px' } 0;
	position: relative;

	.checkout-line-item__price {
		position: relative;
	}
`;

export const CouponLineItem = styled( WPCouponLineItem )< {
	theme?: Theme;
} >`
	.jetpack-partner-logo {
		padding-bottom: 20px;
	}
`;

const GiftBadge = styled.span`
	color: #234929;
	background-color: #b8e6bf;
	margin-bottom: 0.1em;
	padding: 0.1em 0.8em;
	border-radius: 5px;
	display: inline-block;
	font-size: small;
`;

const LineItemMeta = styled.div< { theme?: Theme } >`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-size: 14px;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-content: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 2px 10px;
`;

const UpgradeCreditInformationLineItem = styled( LineItemMeta )< { theme?: Theme } >`
	justify-content: flex-start;
	gap: 4px;
	.gridicon {
		fill: ${ ( props ) => props.theme.colors.textColorLight };
	}
`;

const UpgradeCreditPopover = styled( Popover )< { theme?: Theme } >`
	&.popover .popover__inner {
		color: ${ ( props ) => props.theme.colors.textColorOnDarkBackground };
		background: ${ ( props ) => props.theme.colors.textColorDark };
		text-align: start;
		border-radius: 4px;
		min-height: 32px;
		width: 300px;
		align-items: center;
		font-style: normal;
		padding: 8px 10px;
		overflow-wrap: break-word;
	}
`;

const DiscountCallout = styled.div< { theme?: Theme } >`
	color: ${ ( props ) => props.theme.colors.success };
	display: block;
`;

const NotApplicableCallout = styled.div< { theme?: Theme } >`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	display: block;
`;

const LineItemTitle = styled.div< { theme?: Theme; isSummary?: boolean } >`
	flex: 1;
	word-break: break-word;
	display: flex;
	gap: 0.5em;
	font-weight: ${ ( { theme } ) => theme.weights.bold };
	font-size: ${ hasCheckoutVersion( '2' ) ? '14px' : 'inherit' };
`;

const LineItemPriceWrapper = styled.span< { theme?: Theme; isSummary?: boolean } >`
	margin-left: 12px;
	font-size: ${ hasCheckoutVersion( '2' ) ? '14px' : 'inherit' };
	.rtl & {
		margin-right: 12px;
		margin-left: 0;
	}
`;
const BillingLine = styled.div`
	width: 100%;
	display: ${ hasCheckoutVersion( '2' ) ? 'flex' : 'inherit' };
	justify-content: ${ hasCheckoutVersion( '2' ) ? 'space-between' : 'inherit' };
	align-items: ${ hasCheckoutVersion( '2' ) ? 'center' : 'inherit' };
`;
const DeleteButtonWrapper = styled.div`
	width: 100%;
	display: ${ hasCheckoutVersion( '2' ) ? 'flex' : 'inherit' };
	justify-content: ${ hasCheckoutVersion( '2' ) ? 'flex-end' : 'inherit' };
`;

const DeleteButton = styled( Button )< { theme?: Theme } >`
	width: auto;
	font-size: ${ hasCheckoutVersion( '2' ) ? '14px' : 'inherit' };
	color: ${ ( props ) => props.theme.colors.textColorLight };
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
} ) {
	const id = lineItem.id;
	const itemSpanId = `checkout-line-item-${ id }`;
	const label = lineItem.label;
	const actualAmountDisplay = lineItem.formattedAmount;
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
							buttonType="text-button"
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
							{ hasCheckoutVersion( '2' )
								? translate( 'Remove' )
								: translate( 'Remove from cart' ) }
						</DeleteButton>
					</DeleteButtonWrapper>

					<CheckoutModal
						isVisible={ isModalVisible }
						closeModal={ () => {
							setIsModalVisible( false );
						} }
						secondaryAction={ () => {
							setIsModalVisible( false );
						} }
						primaryAction={ () => {
							removeProductFromCart();
						} }
						secondaryButtonCTA={ String( 'Cancel' ) }
						title={ modalCopy.title }
						copy={ modalCopy.description }
					/>
				</>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

function WPCouponLineItem( {
	lineItem,
	className,
	isSummary,
	hasDeleteButton,
	removeProductFromCart,
	createUserAndSiteBeforeTransaction,
	isPwpoUser,
	hasPartnerCoupon,
}: {
	lineItem: LineItemType;
	className?: string | null;
	isSummary?: boolean;
	hasDeleteButton?: boolean;
	removeProductFromCart?: () => void;
	createUserAndSiteBeforeTransaction?: boolean;
	isPwpoUser?: boolean;
	hasPartnerCoupon?: boolean;
} ) {
	return (
		<div
			className={ joinClasses( [ className, 'coupon-line-item' ] ) }
			data-partner-coupon={ !! hasPartnerCoupon }
		>
			<NonProductLineItem
				lineItem={ lineItem }
				isSummary={ isSummary }
				hasDeleteButton={ hasDeleteButton }
				removeProductFromCart={ removeProductFromCart }
				createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
				isPwpoUser={ isPwpoUser }
			/>
			{ !! hasPartnerCoupon && <PartnerLogo /> }
		</div>
	);
}

function EmailMeta( { product, isRenewal }: { product: ResponseCartProduct; isRenewal: boolean } ) {
	const translate = useTranslate();

	if ( isRenewal ) {
		let numberOfMailboxes = null;

		if ( isGSuiteOrExtraLicenseProductSlug( product.product_slug ) ) {
			numberOfMailboxes = product.volume ?? null;
		}

		if ( isGoogleWorkspaceProductSlug( product.product_slug ) || isTitanMail( product ) ) {
			numberOfMailboxes = product.current_quantity ?? null;
		}

		if ( numberOfMailboxes === null ) {
			return null;
		}

		return (
			<LineItemMeta>
				{ translate(
					'%(numberOfMailboxes)d mailbox for %(domainName)s',
					'%(numberOfMailboxes)d mailboxes for %(domainName)s',
					{
						args: {
							numberOfMailboxes,
							domainName: product.meta,
						},
						count: numberOfMailboxes,
					}
				) }
			</LineItemMeta>
		);
	}

	let mailboxes: GSuiteProductUser[] | TitanProductUser[] | [] = [];

	if (
		isGoogleWorkspaceProductSlug( product.product_slug ) ||
		isGSuiteOrExtraLicenseProductSlug( product.product_slug )
	) {
		mailboxes = product.extra?.google_apps_users ?? [];
	}

	if ( isTitanMail( product ) ) {
		mailboxes = product.extra?.email_users ?? [];
	}

	return (
		<>
			{ mailboxes.map( ( mailbox, index ) => {
				return (
					<LineItemMeta key={ mailbox.email }>
						<div key={ mailbox.email }>{ mailbox.email }</div>

						{ index === 0 && <GSuiteDiscountCallout product={ product } /> }
					</LineItemMeta>
				);
			} ) }
		</>
	);
}

interface ModalCopy {
	title: string;
	description: string;
}

function returnModalCopyForProduct(
	product: ResponseCartProduct,
	translate: ReturnType< typeof useTranslate >,
	hasBundledDomainInCart: boolean,
	hasMarketplaceProductsInCart: boolean,
	createUserAndSiteBeforeTransaction: boolean,
	isPwpoUser: boolean
): ModalCopy {
	const productType = getProductTypeForModalCopy(
		product,
		hasBundledDomainInCart,
		hasMarketplaceProductsInCart,
		isPwpoUser
	);
	const isRenewal = isWpComProductRenewal( product );
	return returnModalCopy( productType, translate, createUserAndSiteBeforeTransaction, isRenewal );
}

function getProductTypeForModalCopy(
	product: ResponseCartProduct,
	hasBundledDomainInCart: boolean,
	hasMarketplaceProductsInCart: boolean,
	isPwpoUser: boolean
): string {
	if ( product.is_gift_purchase ) {
		return 'gift purchase';
	}
	if ( isWpComPlan( product.product_slug ) ) {
		if ( hasMarketplaceProductsInCart ) {
			return 'plan with marketplace dependencies';
		}
		if ( hasBundledDomainInCart && ! isPwpoUser ) {
			return 'plan with domain dependencies';
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
	isRenewal = false
): ModalCopy {
	switch ( productType ) {
		case 'gift purchase':
			return {
				title: String( translate( 'You are about to remove your gift from the cart' ) ),
				description: String(
					translate(
						"When you press Continue, we'll remove all gift products in the cart, and your gift will not be given."
					)
				),
			};
		case 'plan with marketplace dependencies':
			if ( isRenewal ) {
				return {
					title: String( translate( 'You are about to remove your plan renewal from the cart' ) ),
					description: String(
						translate(
							"Since some of your other product(s) depend on your plan to be purchased, they will also be removed from the cart. When you press Continue, we'll remove them along with your plan in the cart, and your plan will keep its current expiry date."
						)
					),
				};
			}

			return {
				title: String( translate( 'You are about to remove your plan from the cart' ) ),
				description: String(
					translate(
						"Since some of your other product(s) depend on your plan to be purchased, they will also be removed from the cart. When you press Continue, we'll remove them along with your new plan in the cart, and your site will continue to run its current plan."
					)
				),
			};
		case 'plan with domain dependencies': {
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
					translate(
						"Since some of your other product(s) depend on your plan to be purchased, they will also be removed from the cart. When you press Continue, we'll remove them along with your new plan in the cart, and your site will continue to run its current plan."
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
							'When you press Continue, we will remove your plan renewal from the cart and your plan will keep its current expiry date.'
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
								'When you press Continue, we will remove your plan from the cart and your site will continue to run with its current plan.'
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

function JetpackSearchMeta( { product }: { product: ResponseCartProduct } ) {
	return <ProductTier product={ product } />;
}

function ProductTier( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();
	if ( isJetpackSearch( product ) && product.price_tier_transform_quantity_divide_by ) {
		const currentQuantity = product.current_quantity || 1;
		let units_used: number;
		if ( product.price_tier_transform_quantity_round === 'down' ) {
			units_used = Math.floor( currentQuantity / product.price_tier_transform_quantity_divide_by );
		} else {
			units_used = Math.ceil( currentQuantity / product.price_tier_transform_quantity_divide_by );
		}
		const purchaseQuantityDividedByThousand =
			( units_used * product.price_tier_transform_quantity_divide_by ) / 1000;
		return (
			<LineItemMeta>
				{ translate(
					'Up to %(purchaseQuantityDividedByThousand)sk records and/or requests per month',
					{ args: { purchaseQuantityDividedByThousand } }
				) }
			</LineItemMeta>
		);
	}
	return null;
}

export function LineItemSublabelAndPrice( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const productSlug = product.product_slug;
	const price = formatCurrency( product.item_original_subtotal_integer, product.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );

	if ( isP2Plus( product ) ) {
		// This is the price for one item for products with a quantity (eg. seats in a license).
		const itemPrice = formatCurrency(
			product.item_original_cost_for_quantity_one_integer,
			product.currency,
			{ isSmallestUnit: true, stripZeros: true }
		);
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
					'Monthly subscription: %(itemPrice)s x %(members)s member',
					'Monthly subscription: %(itemPrice)s x %(members)s members',
					p2Options
				) }
			</>
		);
	}

	if ( isTieredVolumeSpaceAddon( product ) ) {
		const spaceQuantity = product?.quantity ?? 1;
		return (
			<>
				{ translate( '%(quantity)s GB extra space, %(price)s per year', {
					args: { quantity: spaceQuantity, price },
				} ) }
			</>
		);
	}

	if (
		isGoogleWorkspaceProductSlug( productSlug ) ||
		isGSuiteOrExtraLicenseProductSlug( productSlug ) ||
		isTitanMail( product )
	) {
		if ( product.months_per_bill_period === 12 || product.months_per_bill_period === null ) {
			const billingInterval = translate( 'billed annually' );
			return (
				<>
					<DefaultLineItemSublabel product={ product } />: { billingInterval }
				</>
			);
		}

		if ( product.months_per_bill_period === 1 ) {
			const billingInterval = translate( 'billed monthly' );
			return (
				<>
					<DefaultLineItemSublabel product={ product } />: { billingInterval }
				</>
			);
		}

		return <DefaultLineItemSublabel product={ product } />;
	}

	if ( isDIFMProduct( product ) ) {
		const numberOfExtraPages =
			product.quantity && product.price_tier_maximum_units
				? product.quantity - product.price_tier_maximum_units
				: 0;

		if ( numberOfExtraPages > 0 ) {
			const costOfExtraPages = formatCurrency(
				product.item_original_cost_integer - product.item_original_cost_for_quantity_one_integer,
				product.currency,
				{
					stripZeros: true,
					isSmallestUnit: true,
				}
			);

			return (
				<>
					{ translate( 'Service: %(productCost)s one-time fee', {
						args: {
							productCost: formatCurrency(
								product.item_original_cost_for_quantity_one_integer,
								product.currency,
								{ isSmallestUnit: true, stripZeros: true }
							),
						},
					} ) }
					<br></br>
					{ translate(
						'%(numberOfExtraPages)d Extra Page: %(costOfExtraPages)s one-time fee',
						'%(numberOfExtraPages)d Extra Pages: %(costOfExtraPages)s one-time fee',
						{
							args: {
								numberOfExtraPages,
								costOfExtraPages,
							},
							count: numberOfExtraPages,
						}
					) }
				</>
			);
		}
	}

	const isDomainRegistration = product.is_domain_registration;
	const isDomainMapping = productSlug === 'domain_map';
	const isDomainTransfer = productSlug === 'domain_transfer';

	if ( ( isDomainRegistration || isDomainMapping ) && product.months_per_bill_period === 12 ) {
		const premiumLabel = product.extra?.premium ? translate( 'Premium' ) : '';

		return (
			<>
				{ premiumLabel } <DefaultLineItemSublabel product={ product } />
				{ ! product.is_included_for_100yearplan && <>: { translate( 'billed annually' ) }</> }
			</>
		);
	}

	if ( isDomainTransfer ) {
		const premiumLabel = product.extra?.premium ? translate( 'Premium' ) : '';

		return (
			<>
				{ premiumLabel } <DefaultLineItemSublabel product={ product } />:{ ' ' }
				{ translate( 'billed annually' ) } { price }
			</>
		);
	}

	const shouldRenderBasicTermSublabel =
		isPlan( product ) || isAddOn( product ) || isJetpackProductSlug( productSlug );
	if ( shouldRenderBasicTermSublabel && isMonthlyProduct( product ) ) {
		return (
			<>
				<DefaultLineItemSublabel product={ product } />:{ ' ' }
				{ translate( '%(price)s per month', { args: { price } } ) }
			</>
		);
	}

	if ( shouldRenderBasicTermSublabel && isYearly( product ) ) {
		return (
			<>
				<DefaultLineItemSublabel product={ product } />:{ ' ' }
				{ translate( '%(price)s per year', { args: { price } } ) }
			</>
		);
	}

	if ( shouldRenderBasicTermSublabel && isBiennially( product ) ) {
		return (
			<>
				<DefaultLineItemSublabel product={ product } />:{ ' ' }
				{ translate( '%(price)s per two years', { args: { price } } ) }
			</>
		);
	}

	if ( shouldRenderBasicTermSublabel && isTriennially( product ) ) {
		return (
			<>
				<DefaultLineItemSublabel product={ product } />:{ ' ' }
				{ translate( '%(price)s per three years', { args: { price } } ) }
			</>
		);
	}

	return <DefaultLineItemSublabel product={ product } />;
}

function isCouponApplied( { coupon_savings_integer = 0 }: ResponseCartProduct ) {
	return coupon_savings_integer > 0;
}

const UpgradeCreditHelpIconLink = () => {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const translate = useTranslate();
	const ref = useRef( null );

	function toggleIsPopoverOpen() {
		setIsPopoverOpen( ( isPopoverOpen ) => ! isPopoverOpen );
	}

	return (
		<>
			<span
				ref={ ref }
				onMouseEnter={ () => setIsPopoverOpen( true ) }
				onMouseLeave={ () => setIsPopoverOpen( false ) }
				onTouchStart={ toggleIsPopoverOpen }
			>
				<Gridicon icon="help-outline" size={ 18 } />
			</span>
			<UpgradeCreditPopover
				autoPosition={ true }
				context={ ref.current }
				isVisible={ isPopoverOpen }
				hideArrow={ true }
			>
				{ translate(
					'Upgrade now and we’ll automatically apply the remaining credit from your current plan. Remember, upgrade credit can only be used toward plan upgrades for the same website.'
				) }
			</UpgradeCreditPopover>
		</>
	);
};

function UpgradeCreditInformation( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const origCost = product.item_original_subtotal_integer;
	const finalCost = product.item_subtotal_integer;
	const upgradeCredit = origCost - finalCost;
	const planSlug = product.product_slug;
	const isRenewal = product.is_renewal;

	if (
		// Do not display discount reason if there is an introductory offer.
		product.introductory_offer_terms?.enabled ||
		// Do not display discount reason for non-wpcom, non-jetpack products.
		( ! isWpComPlan( planSlug ) && ! isJetpackProductSlug( planSlug ) ) ||
		// Do not display discount reason if there is no discount.
		origCost <= finalCost ||
		// Do not display discount reason if this is a renewal.
		isRenewal ||
		// Do not display discount reason if a coupon is applied.
		isCouponApplied( product )
	) {
		return null;
	}
	if ( isMonthlyProduct( product ) ) {
		return (
			<>
				{ translate( 'Upgrade Credit: %(upgradeCredit)s applied in first month only', {
					comment:
						'The upgrade credit is a pro rated balance of the previous plan which is to be applied' +
						'as a deduction to the first year of next purchased plan. It will be applied once only in the first term',
					args: {
						upgradeCredit: formatCurrency( upgradeCredit, product.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				} ) }
				<UpgradeCreditHelpIconLink />
			</>
		);
	}

	if ( isYearly( product ) ) {
		return (
			<>
				{ translate( 'Upgrade Credit: %(upgradeCredit)s applied in first year only', {
					comment:
						'The upgrade credit is a pro rated balance of the previous plan which is to be applied' +
						'as a deduction to the first year of next purchased plan. It will be applied once only in the first term',
					args: {
						upgradeCredit: formatCurrency( upgradeCredit, product.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				} ) }
				<UpgradeCreditHelpIconLink />
			</>
		);
	}

	if ( isBiennially( product ) || isTriennially( product ) ) {
		return (
			<>
				{ translate( 'Upgrade Credit: %(discount)s applied in first term only', {
					comment:
						'The upgrade credit is a pro rated balance of the previous plan which is to be applied' +
						'as a deduction to the first year of next purchased plan. It will be applied once only in the first term',
					args: {
						discount: formatCurrency( upgradeCredit, product.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
					},
				} ) }
				<UpgradeCreditHelpIconLink />
			</>
		);
	}
	return null;
}

function IntroductoryOfferCallout( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const introductoryOffer = getItemIntroductoryOfferDisplay( translate, product );

	if ( ! introductoryOffer ) {
		return null;
	}

	if ( ! introductoryOffer.enabled ) {
		return <NotApplicableCallout>{ introductoryOffer.text }</NotApplicableCallout>;
	}

	return <DiscountCallout>{ introductoryOffer.text }</DiscountCallout>;
}

function PartnerLogo( { className }: { className?: string } ) {
	const translate = useTranslate();

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<LineItemMeta className={ joinClasses( [ className, 'jetpack-partner-logo' ] ) }>
			<div>{ translate( 'Included in your IONOS plan' ) }</div>
			<div className="checkout-line-item__partner-logo-image">
				<IonosLogo />
			</div>
		</LineItemMeta>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

function DomainDiscountCallout( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();

	if ( product.is_included_for_100yearplan ) {
		return <DiscountCallout>{ translate( 'Included with your plan' ) }</DiscountCallout>;
	}

	if ( product.is_bundled ) {
		return <DiscountCallout>{ translate( 'Discount for first year' ) }</DiscountCallout>;
	}

	const isFreeDomainMapping =
		product.product_slug === 'domain_map' && product.item_subtotal_integer === 0;
	if ( isFreeDomainMapping ) {
		return <DiscountCallout>{ translate( 'Free with your plan' ) }</DiscountCallout>;
	}

	return null;
}

function CouponDiscountCallout( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();

	if ( isCouponApplied( product ) ) {
		return <DiscountCallout>{ translate( 'Discounts applied' ) }</DiscountCallout>;
	}

	return null;
}

function GSuiteDiscountCallout( { product }: { product: ResponseCartProduct } ) {
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

function GiftBadgeWithText() {
	const translate = useTranslate();
	return <GiftBadge>{ translate( 'Gift' ) }</GiftBadge>;
}

const MobileGiftWrapper = styled.div`
	display: block;
	width: 100%;
	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		display: none;
	}
`;

const DesktopGiftWrapper = styled.div`
	display: none;
	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		display: block;
	}
`;

function CheckoutLineItem( {
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
}: PropsWithChildren< {
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
} > ) {
	const id = product.uuid;
	const translate = useTranslate();
	const hasBundledDomainsInCart = responseCart.products.some(
		( product ) =>
			( product.is_domain_registration || product.product_slug === 'domain_transfer' ) &&
			product.is_bundled
	);
	const hasMarketplaceProductsInCart = responseCart.products.some(
		( product ) =>
			product.extra.is_marketplace_product === true ||
			product.product_slug.startsWith( 'wp_mp_theme' )
	);
	const { formStatus } = useFormStatus();
	const itemSpanId = `checkout-line-item-${ id }`;
	const [ isModalVisible, setIsModalVisible ] = useState( false );
	const modalCopy = returnModalCopyForProduct(
		product,
		translate,
		hasBundledDomainsInCart,
		hasMarketplaceProductsInCart,
		createUserAndSiteBeforeTransaction || false,
		isPwpoUser || false
	);
	const isDisabled = formStatus !== FormStatus.READY;

	const isRenewal = isWpComProductRenewal( product );

	const productSlug = product?.product_slug;

	const label = getLabel( product );

	const originalAmountDisplay = formatCurrency(
		product.item_original_subtotal_integer,
		product.currency,
		{ isSmallestUnit: true, stripZeros: true }
	);
	const originalAmountInteger = product.item_original_subtotal_integer;

	const actualAmountDisplay = formatCurrency( product.item_subtotal_integer, product.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
	const isDiscounted = Boolean(
		product.item_subtotal_integer < originalAmountInteger && originalAmountDisplay
	);

	const isEmail =
		isGoogleWorkspaceProductSlug( productSlug ) ||
		isGSuiteOrExtraLicenseProductSlug( productSlug ) ||
		isTitanMail( product );

	const containsPartnerCoupon = getPartnerCoupon( {
		coupon: responseCart.coupon,
	} );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className={ joinClasses( [ className, 'checkout-line-item' ] ) }
			data-e2e-product-slug={ productSlug }
			data-product-type={ isPlan( product ) ? 'plan' : product.product_slug }
		>
			{ responseCart.is_gift_purchase && (
				<MobileGiftWrapper>
					<GiftBadgeWithText />
				</MobileGiftWrapper>
			) }
			<LineItemTitle id={ itemSpanId } isSummary={ isSummary }>
				{ label }
				{ responseCart.is_gift_purchase && (
					<DesktopGiftWrapper>
						<GiftBadgeWithText />
					</DesktopGiftWrapper>
				) }
			</LineItemTitle>
			<span aria-labelledby={ itemSpanId } className="checkout-line-item__price">
				<LineItemPrice
					isDiscounted={ isDiscounted }
					actualAmount={ actualAmountDisplay }
					originalAmount={ originalAmountDisplay }
					isSummary={ isSummary }
				/>
			</span>

			{ ! hasCheckoutVersion( '2' ) && product && ! containsPartnerCoupon && (
				<>
					<UpgradeCreditInformationLineItem>
						<UpgradeCreditInformation product={ product } />
					</UpgradeCreditInformationLineItem>
					<LineItemMeta>
						<LineItemSublabelAndPrice product={ product } />
						<DomainDiscountCallout product={ product } />
						<CouponDiscountCallout product={ product } />
						<IntroductoryOfferCallout product={ product } />
					</LineItemMeta>
				</>
			) }

			{ product && containsPartnerCoupon && (
				<LineItemMeta>
					<LineItemSublabelAndPrice product={ product } />
					<CouponDiscountCallout product={ product } />
				</LineItemMeta>
			) }

			{ isJetpackSearch( product ) && <JetpackSearchMeta product={ product } /> }

			{ isEmail && <EmailMeta product={ product } isRenewal={ isRenewal } /> }
			{ ! hasCheckoutVersion( '2' ) && (
				<>
					{ children }

					{ hasDeleteButton && removeProductFromCart && (
						<>
							<DeleteButtonWrapper>
								<DeleteButton
									className="checkout-line-item__remove-product"
									buttonType="text-button"
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
									let product_uuids_to_remove = [ product.uuid ];

									// Gifts need to be all or nothing, to prevent leaving
									// the site in a state where it requires other purchases
									// in order to actually work correctly for the period of
									// the gift (for example, gifting a plan renewal without
									// a domain renewal would likely lead the site's domain
									// to expire soon afterwards).
									if ( product.is_gift_purchase ) {
										product_uuids_to_remove = responseCart.products
											.filter( ( cart_product ) => cart_product.is_gift_purchase )
											.map( ( cart_product ) => cart_product.uuid );
									}

									Promise.all( product_uuids_to_remove.map( removeProductFromCart ) ).catch( () => {
										// Nothing needs to be done here. CartMessages will display the error to the user.
									} );
									onRemoveProduct?.( label );
								} }
								cancelAction={ () => {
									onRemoveProductCancel?.( label );
								} }
								secondaryAction={ () => {
									onRemoveProductCancel?.( label );
								} }
								secondaryButtonCTA={ String( translate( 'Cancel' ) ) }
								title={ modalCopy.title }
								copy={ modalCopy.description }
							/>
						</>
					) }
				</>
			) }
			{ hasCheckoutVersion( '2' ) && (
				<BillingLine>
					{ children }
					{ hasDeleteButton && removeProductFromCart && (
						<>
							<DeleteButtonWrapper>
								<DeleteButton
									className="checkout-line-item__remove-product"
									buttonType="text-button"
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
									{ hasCheckoutVersion( '2' )
										? translate( 'Remove' )
										: translate( 'Remove from cart' ) }
								</DeleteButton>
							</DeleteButtonWrapper>

							<CheckoutModal
								isVisible={ isModalVisible }
								closeModal={ () => {
									setIsModalVisible( false );
								} }
								primaryAction={ () => {
									let product_uuids_to_remove = [ product.uuid ];

									// Gifts need to be all or nothing, to prevent leaving
									// the site in a state where it requires other purchases
									// in order to actually work correctly for the period of
									// the gift (for example, gifting a plan renewal without
									// a domain renewal would likely lead the site's domain
									// to expire soon afterwards).
									if ( product.is_gift_purchase ) {
										product_uuids_to_remove = responseCart.products
											.filter( ( cart_product ) => cart_product.is_gift_purchase )
											.map( ( cart_product ) => cart_product.uuid );
									}

									Promise.all( product_uuids_to_remove.map( removeProductFromCart ) ).catch( () => {
										// Nothing needs to be done here. CartMessages will display the error to the user.
									} );
									onRemoveProduct?.( label );
								} }
								cancelAction={ () => {
									onRemoveProductCancel?.( label );
								} }
								secondaryAction={ () => {
									onRemoveProductCancel?.( label );
								} }
								secondaryButtonCTA={ String( translate( 'Cancel' ) ) }
								title={ modalCopy.title }
								copy={ modalCopy.description }
							/>
						</>
					) }
				</BillingLine>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
