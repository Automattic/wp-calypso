import {
	isPlan,
	isMonthly,
	getYearlyPlanByMonthly,
	getPlan,
	isDomainProduct,
	isDomainTransfer,
	isWpComPersonalPlan,
	isWpComPlan,
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPremiumPlan,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import {
	CheckoutCheckIcon,
	CheckoutSummaryCard as CheckoutSummaryCardUnstyled,
	FormStatus,
	useFormStatus,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	getCouponLineItemFromCart,
	getTaxBreakdownLineItemsFromCart,
	getTotalLineItemFromCart,
} from '@automattic/wpcom-checkout';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useSelector } from 'react-redux';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getPlanFeatures from '../lib/get-plan-features';
import getRefundText from '../lib/get-refund-text';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

// This will make converting to TS less noisy. The order of components can be reorganized later
/* eslint-disable @typescript-eslint/no-use-before-define */

export default function WPCheckoutOrderSummary( {
	siteId,
	onChangePlanLength,
	nextDomainIsFree = false,
}: {
	siteId: number | undefined;
	onChangePlanLength: ( uuid: string, productSlug: string, productId: number ) => void;
	nextDomainIsFree?: boolean;
} ): JSX.Element {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const taxLineItems = getTaxBreakdownLineItemsFromCart( responseCart );
	const totalLineItem = getTotalLineItemFromCart( responseCart );

	const hasRenewalInCart = responseCart.products.some(
		( product ) => product.extra.purchaseType === 'renewal'
	);

	const isCartUpdating = FormStatus.VALIDATING === formStatus;

	const plan = responseCart.products.find( ( product ) => isPlan( product ) );
	const hasMonthlyPlanInCart = Boolean( plan && isMonthly( plan?.product_slug ) );

	return (
		<CheckoutSummaryCard
			className={ isCartUpdating ? 'is-loading' : '' }
			data-e2e-cart-is-loading={ isCartUpdating }
		>
			<CheckoutSummaryFeatures>
				<CheckoutSummaryFeaturesTitle>
					{ translate( 'Included with your purchase' ) }
				</CheckoutSummaryFeaturesTitle>
				{ isCartUpdating ? (
					<LoadingCheckoutSummaryFeaturesList />
				) : (
					<CheckoutSummaryFeaturesList
						siteId={ siteId }
						hasMonthlyPlanInCart={ hasMonthlyPlanInCart }
						nextDomainIsFree={ nextDomainIsFree }
					/>
				) }
			</CheckoutSummaryFeatures>
			{ ! isCartUpdating && ! hasRenewalInCart && plan && hasMonthlyPlanInCart && (
				<CheckoutSummaryAnnualUpsell plan={ plan } onChangePlanLength={ onChangePlanLength } />
			) }
			<CheckoutSummaryAmountWrapper>
				{ couponLineItem && (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + couponLineItem.id }>
						<span>{ couponLineItem.label }</span>
						<span>{ couponLineItem.amount.displayValue }</span>
					</CheckoutSummaryLineItem>
				) }
				{ taxLineItems.map( ( taxLineItem ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + taxLineItem.id }>
						<span>{ taxLineItem.label }</span>
						<span>{ taxLineItem.amount.displayValue }</span>
					</CheckoutSummaryLineItem>
				) ) }
				<CheckoutSummaryTotal>
					<span>{ translate( 'Total' ) }</span>
					<span className="wp-checkout-order-summary__total-price">
						{ totalLineItem.amount.displayValue }
					</span>
				</CheckoutSummaryTotal>
			</CheckoutSummaryAmountWrapper>
		</CheckoutSummaryCard>
	);
}

function LoadingCheckoutSummaryFeaturesList() {
	return (
		<>
			<LoadingCopy />
			<LoadingCopy />
			<LoadingCopy />
		</>
	);
}

function SwitchToAnnualPlan( {
	plan,
	onChangePlanLength,
	linkText,
}: {
	plan: ResponseCartProduct;
	onChangePlanLength: ( uuid: string, productSlug: string, productId: number ) => void;
	linkText?: React.ReactNode;
} ): JSX.Element {
	const translate = useTranslate();
	const handleClick = () => {
		const annualPlan = getPlan( getYearlyPlanByMonthly( plan.product_slug ) );
		if ( annualPlan ) {
			onChangePlanLength?.( plan.uuid, annualPlan.getStoreSlug(), annualPlan.getProductId() );
		}
	};
	const text = linkText ?? translate( 'Switch to an annual plan and save!' );

	return <SwitchToAnnualPlanButton onClick={ handleClick }>{ text }</SwitchToAnnualPlanButton>;
}

function CheckoutSummaryFeaturesList( props: {
	siteId: number | undefined;
	hasMonthlyPlanInCart: boolean;
	nextDomainIsFree: boolean;
} ) {
	const { hasMonthlyPlanInCart = false, siteId, nextDomainIsFree } = props;

	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const hasDomainsInCart = responseCart.products.some(
		( product ) => isDomainProduct( product ) || isDomainTransfer( product )
	);
	const domains = responseCart.products.filter(
		( product ) => isDomainProduct( product ) || isDomainTransfer( product )
	);
	const hasPlanInCart = responseCart.products.some( ( product ) => isPlan( product ) );
	const translate = useTranslate();
	const isJetpackNotAtomic = useSelector( ( state ) =>
		siteId ? isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) : undefined
	);

	const showRefundText = responseCart.total_cost > 0;

	let refundDays = 0;
	if ( hasDomainsInCart && ! hasPlanInCart ) {
		refundDays = 4;
	} else if ( hasPlanInCart && ! hasDomainsInCart ) {
		refundDays = hasMonthlyPlanInCart ? 7 : 14;
	}
	const refundText = getRefundText( refundDays, null, translate );

	const currentPlan = useSelector( ( state ) =>
		siteId ? getCurrentPlan( state, siteId ) : undefined
	);
	const billingPeriod = useSelector( getBillingInterval );
	const isAnnualPeriod = billingPeriod === IntervalLength.ANNUALLY;

	const currentPlanSlug = currentPlan?.productSlug;

	const isChatAvailable =
		! hasPlanInCart &&
		currentPlanSlug &&
		( isWpComPremiumPlan( currentPlanSlug ) ||
			isWpComBusinessPlan( currentPlanSlug ) ||
			isWpComEcommercePlan( currentPlanSlug ) ) &&
		isAnnualPeriod;

	return (
		<CheckoutSummaryFeaturesListWrapper>
			{ hasDomainsInCart &&
				domains.map( ( domain ) => {
					return <CheckoutSummaryFeaturesListDomainItem domain={ domain } key={ domain.uuid } />;
				} ) }
			{ hasPlanInCart && (
				<CheckoutSummaryPlanFeatures
					hasDomainsInCart={ hasDomainsInCart }
					nextDomainIsFree={ nextDomainIsFree }
				/>
			) }
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon id="features-list-support-text" />
				<SupportText hasPlanInCart={ hasPlanInCart } isJetpackNotAtomic={ isJetpackNotAtomic } />
			</CheckoutSummaryFeaturesListItem>
			{ isChatAvailable && (
				<CheckoutSummaryFeaturesListItem>
					<WPCheckoutCheckIcon id={ 'annual-live-chat' } />
					{ translate( 'Live chat support' ) }
				</CheckoutSummaryFeaturesListItem>
			) }

			{ showRefundText && (
				<CheckoutSummaryFeaturesListItem>
					<WPCheckoutCheckIcon id="features-list-refund-text" />
					{ refundText }
				</CheckoutSummaryFeaturesListItem>
			) }
		</CheckoutSummaryFeaturesListWrapper>
	);
}

function SupportText( {
	hasPlanInCart,
	isJetpackNotAtomic,
}: {
	hasPlanInCart?: boolean;
	isJetpackNotAtomic?: boolean | null;
} ) {
	const translate = useTranslate();

	if ( hasPlanInCart && ! isJetpackNotAtomic ) {
		return <span>{ translate( 'Unlimited customer support via email' ) }</span>;
	}

	return <span>{ translate( 'Customer support via email' ) }</span>;
}

function CheckoutSummaryFeaturesListDomainItem( { domain }: { domain: ResponseCartProduct } ) {
	const translate = useTranslate();
	const bundledText = translate( 'free for one year' );
	const bundledDomain = translate( '{{strong}}%(domain)s{{/strong}} - %(bundled)s', {
		components: {
			strong: <strong />,
		},
		args: {
			domain: domain.meta,
			bundled: bundledText,
		},
		comment: 'domain name and bundling message, separated by a dash',
	} );

	// If domain is using existing credit or bundled with cart, show bundled text.
	if ( domain.is_bundled ) {
		return (
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon id={ `feature-list-domain-item-${ domain.meta }` } />
				{ bundledDomain }
			</CheckoutSummaryFeaturesListItem>
		);
	}

	return (
		<CheckoutSummaryFeaturesListItem>
			<WPCheckoutCheckIcon id={ `feature-list-domain-item-${ domain.meta }` } />
			<strong>{ domain.meta }</strong>
		</CheckoutSummaryFeaturesListItem>
	);
}

function CheckoutSummaryPlanFeatures( props: {
	hasDomainsInCart: boolean;
	nextDomainIsFree: boolean;
} ) {
	const { hasDomainsInCart, nextDomainIsFree } = props;

	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const planInCart = responseCart.products.find( ( product ) => isPlan( product ) );
	const hasRenewalInCart = responseCart.products.some(
		( product ) => product.extra.purchaseType === 'renewal'
	);
	const planFeatures = getPlanFeatures(
		planInCart,
		translate,
		hasDomainsInCart,
		hasRenewalInCart,
		nextDomainIsFree
	);

	return (
		<>
			{ planFeatures.map( ( feature ) => {
				const isSupported = ! feature.startsWith( '~~' );
				if ( ! isSupported ) {
					feature = feature.substr( 2 );
				}

				return (
					<CheckoutSummaryFeaturesListItem key={ String( feature ) } isSupported={ isSupported }>
						{ isSupported ? (
							<WPCheckoutCheckIcon id={ feature.replace( /[^\w]/g, '_' ) } />
						) : (
							<WPCheckoutCrossIcon />
						) }
						{ feature }
					</CheckoutSummaryFeaturesListItem>
				);
			} ) }
		</>
	);
}

function CheckoutSummaryAnnualUpsell( props: {
	plan: ResponseCartProduct;
	onChangePlanLength: ( uuid: string, productSlug: string, productId: number ) => void;
} ) {
	const translate = useTranslate();
	const productSlug = props.plan?.product_slug;

	if ( ! productSlug || ! isWpComPlan( productSlug ) ) {
		return null;
	}

	return (
		<CheckoutSummaryFeaturesUpsell>
			<CheckoutSummaryFeaturesTitle>
				<SwitchToAnnualPlan
					plan={ props.plan }
					onChangePlanLength={ props.onChangePlanLength }
					linkText={ translate( 'Included with an annual plan' ) }
				/>
			</CheckoutSummaryFeaturesTitle>
			<CheckoutSummaryFeaturesListWrapper>
				<CheckoutSummaryFeaturesListItem isSupported={ false }>
					<WPCheckoutCheckIcon id={ 'annual-domain-credit' } />
					{ translate( 'Free domain for one year' ) }
				</CheckoutSummaryFeaturesListItem>
				{ ! isWpComPersonalPlan( productSlug ) && (
					<CheckoutSummaryFeaturesListItem isSupported={ false }>
						<WPCheckoutCheckIcon id={ 'annual-live-chat' } />
						{ translate( 'Live chat support' ) }
					</CheckoutSummaryFeaturesListItem>
				) }
			</CheckoutSummaryFeaturesListWrapper>
			<SwitchToAnnualPlan plan={ props.plan } onChangePlanLength={ props.onChangePlanLength } />
		</CheckoutSummaryFeaturesUpsell>
	);
}

const pulse = keyframes`
	0% { opacity: 1; }

	70% { opacity: 0.25; }

	100% { opacity: 1; }
`;

const CheckoutSummaryCard = styled( CheckoutSummaryCardUnstyled )`
	border-bottom: none 0;
`;

const CheckoutSummaryFeatures = styled.div`
	padding: 24px 24px 0;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding: 24px;
	}
`;

const CheckoutSummaryFeaturesUpsell = styled( CheckoutSummaryFeatures )`
	padding: 12px 24px 0;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding: 0 24px 24px;
	}

	& svg {
		opacity: 50%;
	}
`;

const CheckoutSummaryFeaturesTitle = styled.h3`
	font-size: 14px;
	font-weight: ${ ( props ) => props.theme.weights.bold };
	margin-bottom: 6px;

	& button {
		font-size: 14px;
		font-weight: ${ ( props ) => props.theme.weights.bold };
		text-decoration: none;
	}
`;

const CheckoutSummaryFeaturesListWrapper = styled.ul`
	margin: 0;
	list-style: none;
	font-size: 14px;
`;

const WPCheckoutCheckIcon = styled( CheckoutCheckIcon )`
	fill: ${ ( props ) => props.theme.colors.success };
	margin-right: 4px;
	position: absolute;
	top: 0;
	left: 0;

	.rtl & {
		margin-right: 0;
		margin-left: 4px;
		right: 0;
		left: auto;
	}
`;

const StyledGridicon = styled( Gridicon )`
	margin-right: 4px;
	position: absolute;
	top: 2px;
	left: 0;

	.rtl & {
		margin-right: 0;
		margin-left: 4px;
		right: 0;
		left: auto;
	}
`;

const WPCheckoutCrossIcon = () => <StyledGridicon icon="cross" size={ 20 } />;

const CheckoutSummaryFeaturesListItem = styled( 'li' )< { isSupported?: boolean } >`
	margin-bottom: 4px;
	padding-left: 24px;
	position: relative;
	overflow-wrap: break-word;
	color: ${ ( props ) => ( props.isSupported ? 'inherit' : 'var( --color-neutral-40 )' ) };

	.rtl & {
		padding-right: 24px;
		padding-left: 0;
	}
`;
CheckoutSummaryFeaturesListItem.defaultProps = {
	isSupported: true,
};

const CheckoutSummaryAmountWrapper = styled.div`
	padding: 24px;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	}
`;

const CheckoutSummaryLineItem = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	margin-bottom: 4px;

	.is-loading & {
		animation: ${ pulse } 1.5s ease-in-out infinite;
	}
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	font-weight: ${ ( props ) => props.theme.weights.bold };
`;

const LoadingCopy = styled.p`
	animation: ${ pulse } 1.5s ease-in-out infinite;
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	border-radius: 2px;
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	content: '';
	font-size: 14px;
	height: 18px;
	margin: 8px 0 0 26px;
	padding: 0;
	position: relative;

	::before {
		content: '';
		display: block;
		position: absolute;
		left: -26px;
		top: 0;
		width: 18px;
		height: 18px;
		background: ${ ( props ) => props.theme.colors.borderColorLight };
		border-radius: 100%;
	}

	.rtl & {
		margin: 8px 26px 0 0;

		::before {
			right: -26px;
			left: auto;
		}
	}
`;

const SwitchToAnnualPlanButton = styled.button`
	text-align: left;
	text-decoration: underline;
	color: var( --color-link );
	cursor: pointer;

	.rtl & {
		text-align: right;
	}

	&:hover {
		text-decoration: none;
	}
`;
