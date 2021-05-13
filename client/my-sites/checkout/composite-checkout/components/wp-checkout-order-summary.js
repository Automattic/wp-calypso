/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import {
	CheckoutCheckIcon,
	CheckoutSummaryCard as CheckoutSummaryCardUnstyled,
	FormStatus,
	useFormStatus,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	getCouponLineItemFromCart,
	getTaxLineItemFromCart,
	getTotalLineItemFromCart,
} from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import { isPlan, isMonthly, getYearlyPlanByMonthly, getPlan } from '@automattic/calypso-products';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import Gridicon from 'calypso/components/gridicon';
import getPlanFeatures from '../lib/get-plan-features';
import { hasDomainCredit } from 'calypso/state/sites/plans/selectors';

export default function WPCheckoutOrderSummary( {
	siteId,
	onChangePlanLength,
	nextDomainIsFree = false,
} = {} ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();
	const { responseCart } = useShoppingCart();
	const couponLineItem = getCouponLineItemFromCart( responseCart );
	const taxLineItem = getTaxLineItemFromCart( responseCart );
	const totalLineItem = getTotalLineItemFromCart( responseCart );

	const hasRenewalInCart = responseCart.products.some(
		( product ) => product.extra.purchaseType === 'renewal'
	);

	const isCartUpdating = FormStatus.VALIDATING === formStatus;

	const plan = responseCart.products.find( ( product ) => isPlan( product ) );
	const hasMonthlyPlan = Boolean( plan && isMonthly( plan?.product_slug ) );

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
						hasMonthlyPlan={ hasMonthlyPlan }
						nextDomainIsFree={ nextDomainIsFree }
					/>
				) }
				{ ! isCartUpdating && hasMonthlyPlan && ! hasRenewalInCart && (
					<SwitchToAnnualPlan plan={ plan } onChangePlanLength={ onChangePlanLength } />
				) }
			</CheckoutSummaryFeatures>
			<CheckoutSummaryAmountWrapper>
				{ couponLineItem && (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + couponLineItem.id }>
						<span>{ couponLineItem.label }</span>
						<span>{ couponLineItem.amount.displayValue }</span>
					</CheckoutSummaryLineItem>
				) }
				{ taxLineItem && (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + taxLineItem.id }>
						<span>{ taxLineItem.label }</span>
						<span>{ taxLineItem.amount.displayValue }</span>
					</CheckoutSummaryLineItem>
				) }
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

function SwitchToAnnualPlan( { plan, onChangePlanLength } ) {
	const translate = useTranslate();
	const handleClick = () => {
		const annualPlan = getPlan( getYearlyPlanByMonthly( plan.product_slug ) );
		if ( annualPlan ) {
			onChangePlanLength?.( plan.uuid, annualPlan.getStoreSlug(), annualPlan.getProductId() );
		}
	};

	return (
		<SwitchToAnnualPlanButton onClick={ handleClick }>
			{ translate( 'Switch to annual plan' ) }
		</SwitchToAnnualPlanButton>
	);
}

function CheckoutSummaryFeaturesList( props ) {
	const { responseCart } = useShoppingCart();
	const hasDomainsInCart = responseCart.products.some(
		( product ) => product.is_domain_registration || product.product_slug === 'domain_transfer'
	);
	const domains = responseCart.products.filter(
		( product ) => product.is_domain_registration || product.product_slug === 'domain_transfer'
	);
	const hasPlanInCart = responseCart.products.some( ( product ) => isPlan( product ) );
	const translate = useTranslate();
	const siteId = props.siteId;
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const { hasMonthlyPlan = false } = props;

	const showRefundText = responseCart.total_cost > 0;
	let refundText = translate( 'Money back guarantee' );

	let refundDays = 0;
	if ( hasDomainsInCart && ! hasPlanInCart ) {
		refundDays = 4;
	} else if ( hasPlanInCart && ! hasDomainsInCart ) {
		refundDays = hasMonthlyPlan ? 7 : 14;
	}

	if ( refundDays !== 0 ) {
		// Using plural translation because some languages have multiple plural forms and no plural-agnostic.
		refundText = translate(
			'%(days)d-day money back guarantee',
			'%(days)d-day money back guarantee',
			{
				count: refundDays,
				args: { days: refundDays },
			}
		);
	}

	return (
		<CheckoutSummaryFeaturesListWrapper>
			{ hasDomainsInCart &&
				domains.map( ( domain ) => {
					return (
						<CheckoutSummaryFeaturesListDomainItem
							domain={ domain }
							key={ domain.uuid }
							{ ...props }
						/>
					);
				} ) }
			{ hasPlanInCart && <CheckoutSummaryPlanFeatures { ...props } /> }
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon />
				<SupportText
					hasPlanInCart={ hasPlanInCart }
					isJetpackNotAtomic={ isJetpackNotAtomic }
					{ ...props }
				/>
			</CheckoutSummaryFeaturesListItem>
			{ showRefundText && (
				<CheckoutSummaryFeaturesListItem>
					<WPCheckoutCheckIcon />
					{ refundText }
				</CheckoutSummaryFeaturesListItem>
			) }
		</CheckoutSummaryFeaturesListWrapper>
	);
}

function SupportText( { hasPlanInCart, isJetpackNotAtomic } ) {
	const translate = useTranslate();

	if ( hasPlanInCart && ! isJetpackNotAtomic ) {
		return <span>{ translate( 'Unlimited email support' ) }</span>;
	}

	return <span>{ translate( 'Email support' ) }</span>;
}

function CheckoutSummaryFeaturesListDomainItem( { domain, hasMonthlyPlan, nextDomainIsFree } ) {
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
	const annualPlanOnly = translate( '(annual plans only)', {
		comment: 'Label attached to a feature',
	} );

	const isSupported = ! ( hasMonthlyPlan && nextDomainIsFree );
	let label = <strong>{ domain.meta }</strong>;

	if ( domain.is_bundled ) {
		label = bundledDomain;
	} else if ( hasMonthlyPlan && nextDomainIsFree ) {
		label = (
			<>
				{ bundledDomain }
				{ ` ` }
				{ annualPlanOnly }
			</>
		);
	}

	return (
		<CheckoutSummaryFeaturesListItem isSupported={ isSupported }>
			{ isSupported ? <WPCheckoutCheckIcon /> : <WPCheckoutCrossIcon /> }
			{ label }
		</CheckoutSummaryFeaturesListItem>
	);
}

function CheckoutSummaryPlanFeatures( { siteId } ) {
	const translate = useTranslate();
	const { responseCart } = useShoppingCart();
	const hasDomainsInCart = responseCart.products.some(
		( product ) => product.is_domain_registration || product.product_slug === 'domain_transfer'
	);
	const planInCart = responseCart.products.find( ( product ) => isPlan( product ) );
	const hasRenewalInCart = responseCart.products.some(
		( product ) => product.extra.purchaseType === 'renewal'
	);
	const planHasDomainCredit = useSelector( ( state ) => hasDomainCredit( state, siteId ) );
	const planFeatures = getPlanFeatures(
		planInCart,
		translate,
		hasDomainsInCart,
		hasRenewalInCart,
		planHasDomainCredit
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
						{ isSupported ? <WPCheckoutCheckIcon /> : <WPCheckoutCrossIcon /> }
						{ feature }
					</CheckoutSummaryFeaturesListItem>
				);
			} ) }
		</>
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
	padding: 20px 20px 0;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding: 20px;
	}
`;

const CheckoutSummaryFeaturesTitle = styled.h3`
	font-size: 16px;
	font-weight: ${ ( props ) => props.theme.weights.normal };
	margin-bottom: 6px;
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

const CheckoutSummaryFeaturesListItem = styled.li`
	margin-bottom: 4px;
	padding-left: 24px;
	position: relative;
	overflow-wrap: break-word;
	color: ${ ( props ) => ( props.isSupported ? 'inherit' : 'var( --color-neutral-30 )' ) };

	.rtl & {
		padding-right: 24px;
		padding-left: 0;
	}
`;
CheckoutSummaryFeaturesListItem.defaultProps = {
	isSupported: true,
};

const CheckoutSummaryAmountWrapper = styled.div`
	padding: 20px;

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
	margin-top: 16px;
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
