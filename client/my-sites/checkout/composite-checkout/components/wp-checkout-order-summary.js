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
	useSelect,
} from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { showInlineHelpPopover } from 'calypso/state/inline-help/actions';
import PaymentChatButton from 'calypso/my-sites/checkout/checkout/payment-chat-button';
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
} from 'calypso/lib/plans';
import { isMonthly } from 'calypso/lib/plans/constants';
import isPresalesChatAvailable from 'calypso/state/happychat/selectors/is-presales-chat-available';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import isSupportVariationDetermined from 'calypso/state/selectors/is-support-variation-determined';
import { isEnabled } from 'calypso/config';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import Gridicon from 'calypso/components/gridicon';
import Experiment, {
	DefaultVariation,
	Variation,
	LoadingVariations,
} from 'calypso/components/experiment';

export default function WPCheckoutOrderSummary() {
	const translate = useTranslate();
	const taxes = useLineItemsOfType( 'tax' );
	const coupons = useLineItemsOfType( 'coupon' );
	const total = useTotal();
	const { formStatus } = useFormStatus();

	const isCartUpdating = FormStatus.VALIDATING === formStatus;

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
					<CheckoutSummaryFeaturesListWithMonthlyPricingTest />
				) }
				<CheckoutSummaryHelp />
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

function CheckoutSummaryFeaturesListWithMonthlyPricingTest() {
	const plan = usePlanInCart();
	const hasMonthlyPlan = isMonthly( plan?.wpcom_meta?.product_slug );

	return (
		<Experiment name="monthly_pricing_test_phase_1">
			<DefaultVariation name="control">
				<CheckoutSummaryFeaturesList isMonthlyPricingTest={ false } />
			</DefaultVariation>
			<Variation name="treatment">
				<CheckoutSummaryFeaturesList
					isMonthlyPricingTest={ true }
					hasMonthlyPlan={ hasMonthlyPlan }
				/>
			</Variation>
			<LoadingVariations>
				<LoadingCheckoutSummaryFeaturesList />
			</LoadingVariations>
		</Experiment>
	);
}

function CheckoutSummaryFeaturesList( props ) {
	const hasDomainsInCart = useHasDomainsInCart();
	const domains = useDomainsInCart();
	const hasPlanInCart = useHasPlanInCart();
	const translate = useTranslate();
	const siteId = useSelect( ( select ) => select( 'wpcom' )?.getSiteId?.() );
	const isJetpackNotAtomic = useSelector(
		( state ) => isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
	);
	const { isMonthlyPricingTest = false, hasMonthlyPlan = false } = props;

	let refundText = translate( 'Money back guarantee' );
	if ( hasDomainsInCart && ! hasPlanInCart ) {
		refundText = translate( '4 day money back guarantee' );
	} else if ( hasPlanInCart && ! hasDomainsInCart ) {
		refundText = translate( '30 day money back guarantee' );
		if ( isMonthlyPricingTest && hasMonthlyPlan ) {
			refundText = translate( '5 day money back guarantee' );
		}
	}

	return (
		<CheckoutSummaryFeaturesListWrapper>
			{ hasDomainsInCart &&
				domains.map( ( domain ) => {
					return <CheckoutSummaryFeaturesListDomainItem domain={ domain } key={ domain.id } />;
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

function SupportText( { hasPlanInCart, isJetpackNotAtomic, isMonthlyPricingTest } ) {
	const translate = useTranslate();
	const plan = usePlanInCart();

	if ( hasPlanInCart && ! isJetpackNotAtomic ) {
		if ( isMonthlyPricingTest ) {
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

function CheckoutSummaryFeaturesListDomainItem( { domain } ) {
	const translate = useTranslate();
	return (
		<CheckoutSummaryFeaturesListItem>
			<WPCheckoutCheckIcon />
			{ domain.wpcom_meta.is_bundled ? (
				translate( '{{strong}}%(domain)s{{/strong}} - %(bundled)s', {
					components: {
						strong: <strong />,
					},
					args: {
						domain: domain.wpcom_meta.meta,
						bundled: translate( 'free for a year with your plan' ),
					},
					comment: 'domain name and bundling message, separated by a dash',
				} )
			) : (
				<strong>{ domain.wpcom_meta.meta }</strong>
			) }
		</CheckoutSummaryFeaturesListItem>
	);
}

function CheckoutSummaryPlanFeatures( { isMonthlyPricingTest } ) {
	const translate = useTranslate();
	const hasDomainsInCart = useHasDomainsInCart();
	const planInCart = usePlanInCart();
	const hasRenewalInCart = useHasRenewalInCart();
	const planFeatures = getPlanFeatures(
		planInCart,
		translate,
		hasDomainsInCart,
		hasRenewalInCart,
		isMonthlyPricingTest
	);

	return (
		<>
			{ planFeatures.filter( Boolean ).map( ( feature ) => {
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

function getPlanFeatures(
	plan,
	translate,
	hasDomainsInCart,
	hasRenewalInCart,
	isMonthlyPricingTest
) {
	const showFreeDomainFeature = ! hasDomainsInCart && ! hasRenewalInCart;
	const productSlug = plan.wpcom_meta?.product_slug;
	const annualPlansOnly = translate( '(annual plans only)', {
		comment: 'Label attached to a feature',
	} );

	if ( ! productSlug ) {
		return [];
	}

	if ( [ 'personal-bundle', 'personal-bundle-2y' ].includes( productSlug ) ) {
		return [
			isMonthlyPricingTest && translate( 'Live chat and email support' ),
			showFreeDomainFeature && translate( 'Free domain for one year' ),
			translate( 'Dozens of Free Themes' ),
			translate( 'Remove WordPress.com ads' ),
			translate( 'Limit your content to paying subscribers.' ),
		];
	}

	if ( 'personal-bundle-monthly' === productSlug ) {
		return [
			`~~${ translate( 'Live chat support' ) } ${ annualPlansOnly }`,
			showFreeDomainFeature &&
				`~~${ translate( 'Free domain for one year' ) } ${ annualPlansOnly }`,
			translate( 'Email support' ),
			translate( 'Dozens of Free Themes' ),
		];
	}

	if ( [ 'value_bundle', 'value_bundle-2y' ].includes( productSlug ) ) {
		return [
			showFreeDomainFeature && translate( 'Free domain for one year' ),
			translate( 'Unlimited access to our library of Premium Themes' ),
			isEnabled( 'earn/pay-with-paypal' )
				? translate( 'Subscriber-only content and Pay with PayPal buttons' )
				: translate( 'Subscriber-only content and payment buttons' ),
			translate( 'Track your stats with Google Analytics' ),
		];
	} else if (
		'business-bundle' === plan.wpcom_meta?.product_slug ||
		'business-bundle-2y' === plan.wpcom_meta?.product_slug
	) {
		return [
			showFreeDomainFeature && translate( 'Free domain for one year' ),
			translate( 'Install custom plugins and themes' ),
			translate( 'Drive traffic to your site with our advanced SEO tools' ),
			translate( 'Track your stats with Google Analytics' ),
			translate( 'Real-time backups and activity logs' ),
		];
	} else if (
		'ecommerce-bundle' === plan.wpcom_meta?.product_slug ||
		'ecommerce-bundle-2y' === plan.wpcom_meta?.product_slug
	) {
		return [
			showFreeDomainFeature && translate( 'Free domain for one year' ),
			translate( 'Install custom plugins and themes' ),
			translate( 'Accept payments in 60+ countries' ),
			translate( 'Integrations with top shipping carriers' ),
			translate( 'Unlimited products or services for your online store' ),
			translate( 'eCommerce marketing tools for emails and social networks' ),
		];
	}
	return [];
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

function CheckoutSummaryHelp() {
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
		<>
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
		</>
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

	.checkout__payment-chat-button.is-borderless {
		color: ${ ( props ) => props.theme.colors.textColor };
		padding: 0;

		svg {
			width: 20px;
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

		&:hover {
			text-decoration: none;
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
