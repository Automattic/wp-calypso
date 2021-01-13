/**
 * External dependencies
 */
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import {
	CheckoutCheckIcon,
	CheckoutSummaryCard as CheckoutSummaryCardUnstyled,
	FormStatus,
	useEvents,
	useFormStatus,
	useLineItemsOfType,
	useTotal,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { showInlineHelpPopover } from 'calypso/state/inline-help/actions';
import PaymentChatButton from './payment-chat-button';
import getSupportVariation, {
	SUPPORT_HAPPYCHAT,
	SUPPORT_FORUM,
	SUPPORT_DIRECTLY,
} from 'calypso/state/selectors/get-inline-help-support-variation';
import { useHasDomainsInCart, useDomainsInCart } from '../hooks/has-domains';
import { useHasPlanInCart, usePlanInCart } from '../hooks/has-plan';
import { useHasRenewalInCart } from '../hooks/has-renewal';
import {
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
	getYearlyPlanByMonthly,
	getPlan,
} from 'calypso/lib/plans';
import { isMonthly } from 'calypso/lib/plans/constants';
import isPresalesChatAvailable from 'calypso/state/happychat/selectors/is-presales-chat-available';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import isSupportVariationDetermined from 'calypso/state/selectors/is-support-variation-determined';
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
	const taxes = useLineItemsOfType( 'tax' );
	const coupons = useLineItemsOfType( 'coupon' );
	const total = useTotal();
	const { formStatus } = useFormStatus();

	const isCartUpdating = FormStatus.VALIDATING === formStatus;

	const plan = usePlanInCart();
	const hasMonthlyPlan = Boolean( plan && isMonthly( plan?.wpcom_meta?.product_slug ) );

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
				{ ! isCartUpdating && hasMonthlyPlan && (
					<SwitchToAnnualPlan plan={ plan } onChangePlanLength={ onChangePlanLength } />
				) }
			</CheckoutSummaryFeatures>
			<CheckoutSummaryAmountWrapper>
				{ coupons.map( ( coupon ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + coupon.id }>
						<span>{ coupon.label }</span>
						<span>{ coupon.amount.displayValue }</span>
					</CheckoutSummaryLineItem>
				) ) }
				{ taxes.map( ( tax ) => (
					<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + tax.id }>
						<span>{ tax.label }</span>
						<span>{ tax.amount.displayValue }</span>
					</CheckoutSummaryLineItem>
				) ) }
				<CheckoutSummaryTotal>
					<span>{ translate( 'Total' ) }</span>
					<span className="wp-checkout-order-summary__total-price">
						{ total.amount.displayValue }
					</span>
				</CheckoutSummaryTotal>
			</CheckoutSummaryAmountWrapper>
			<CheckoutSummaryHelp />
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
		const annualPlan = getPlan( getYearlyPlanByMonthly( plan.wpcom_meta.product_slug ) );
		if ( annualPlan ) {
			onChangePlanLength?.(
				plan.wpcom_meta.uuid,
				annualPlan.getStoreSlug(),
				annualPlan.getProductId()
			);
		}
	};

	return (
		<SwitchToAnnualPlanButton onClick={ handleClick }>
			{ translate( 'Switch to annual plan' ) }
		</SwitchToAnnualPlanButton>
	);
}

function CheckoutSummaryFeaturesList( props ) {
	const hasDomainsInCart = useHasDomainsInCart();
	const domains = useDomainsInCart();
	const hasPlanInCart = useHasPlanInCart();
	const translate = useTranslate();
	const siteId = props.siteId;
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const { hasMonthlyPlan = false } = props;

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
							key={ domain.id }
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
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon />
				{ refundText }
			</CheckoutSummaryFeaturesListItem>
		</CheckoutSummaryFeaturesListWrapper>
	);
}

function SupportText( { hasPlanInCart, isJetpackNotAtomic, hasMonthlyPlan } ) {
	const translate = useTranslate();
	const plan = usePlanInCart();

	if ( hasPlanInCart && ! isJetpackNotAtomic ) {
		if ( hasMonthlyPlan ) {
			return null;
		}

		if (
			'personal-bundle' === plan.wpcom_meta?.product_slug ||
			'personal-bundle-2y' === plan.wpcom_meta?.product_slug
		) {
			return <span>{ translate( 'Access unlimited email support' ) }</span>;
		}

		return <span>{ translate( 'Email and live chat support' ) }</span>;
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
			domain: domain.wpcom_meta.meta,
			bundled: bundledText,
		},
		comment: 'domain name and bundling message, separated by a dash',
	} );
	const annualPlanOnly = translate( '(annual plans only)', {
		comment: 'Label attached to a feature',
	} );

	const isSupported = ! ( hasMonthlyPlan && nextDomainIsFree );
	let label = <strong>{ domain.wpcom_meta.meta }</strong>;

	if ( domain.wpcom_meta.is_bundled ) {
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
	const hasDomainsInCart = useHasDomainsInCart();
	const planInCart = usePlanInCart();
	const hasRenewalInCart = useHasRenewalInCart();
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

function getHighestWpComPlanLabel( plans ) {
	const planMatchersInOrder = [
		{ label: 'WordPress.com eCommerce', matcher: isWpComEcommercePlan },
		{ label: 'WordPress.com Business', matcher: isWpComBusinessPlan },
		{ label: 'WordPress.com Premium', matcher: isWpComPremiumPlan },
		{ label: 'WordPress.com Personal', matcher: isWpComPersonalPlan },
	];
	for ( const { label, matcher } of planMatchersInOrder ) {
		for ( const plan of plans ) {
			if ( matcher( get( plan, 'wpcom_meta.product_slug' ) ) ) {
				return label;
			}
		}
	}
}

export function CheckoutSummaryHelp() {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const plans = useLineItemsOfType( 'plan' );

	const supportVariationDetermined = useSelector( isSupportVariationDetermined );
	const supportVariation = useSelector( getSupportVariation );

	const happyChatAvailable = useSelector( isHappychatAvailable );
	const presalesChatAvailable = useSelector( isPresalesChatAvailable );
	const presalesEligiblePlanLabel = getHighestWpComPlanLabel( plans );
	const isPresalesChatEligible = presalesChatAvailable && presalesEligiblePlanLabel;

	const onEvent = useEvents();
	const handleHelpButtonClicked = () => {
		onEvent( { type: 'calypso_checkout_composite_summary_help_click' } );
		reduxDispatch( showInlineHelpPopover() );
	};

	// If chat is available and the cart has a pre-sales plan or is already eligible for chat.
	const shouldRenderPaymentChatButton =
		happyChatAvailable && ( isPresalesChatEligible || supportVariation === SUPPORT_HAPPYCHAT );

	const hasDirectSupport =
		supportVariation !== SUPPORT_DIRECTLY && supportVariation !== SUPPORT_FORUM;

	// If chat isn't available, use the inline help button instead.
	return (
		<CheckoutSummaryHelpWrapper>
			<QuerySupportTypes />
			{ ! shouldRenderPaymentChatButton && ! supportVariationDetermined && <LoadingButton /> }
			{ shouldRenderPaymentChatButton ? (
				<PaymentChatButton plan={ presalesEligiblePlanLabel } />
			) : (
				supportVariationDetermined && (
					<CheckoutSummaryHelpButton onClick={ handleHelpButtonClicked }>
						{ hasDirectSupport
							? translate( 'Questions? {{underline}}Ask a Happiness Engineer{{/underline}}', {
									components: {
										underline: <span />,
									},
							  } )
							: translate(
									'Questions? {{underline}}Read more about plans and purchases{{/underline}}',
									{
										components: {
											underline: <span />,
										},
									}
							  ) }
					</CheckoutSummaryHelpButton>
				)
			) }
		</CheckoutSummaryHelpWrapper>
	);
}

const pulse = keyframes`
	0% {
		opacity: 1;
	}

	70% {
		opacity: 0.25;
	}

	100% {
		opacity: 1;
	}
`;

const CheckoutSummaryCard = styled( CheckoutSummaryCardUnstyled )`
	border-bottom: none 0;
`;

const CheckoutSummaryFeatures = styled.div`
	padding: 20px 20px 0;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding: 20px;
	}

	.payment-chat-button.is-borderless {
		color: ${ ( props ) => props.theme.colors.textColor };
		padding: 0;

		svg {
			margin-right: 4px;
			width: 20px;

			.rtl & {
				margin-right: 0;
				margin-left: 4px;
			}
		}
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

const CheckoutSummaryHelpButton = styled.button`
	margin-top: 16px;
	text-align: left;

	.rtl & {
		text-align: right;
	}

	span {
		cursor: pointer;
		text-decoration: underline;
		color: var( --color-link );

		&:hover {
			text-decoration: none;
		}
	}
`;

const CheckoutSummaryHelpWrapper = styled.div`
	position: absolute;

	@media screen and ( max-width: 960px ) {
		position: static;
		padding: 0 20px 20px;

		> button {
			margin-top: 0;
		}
	}
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

const LoadingButton = styled( LoadingCopy )`
	margin: 16px 8px 0;

	::before {
		display: none;
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
