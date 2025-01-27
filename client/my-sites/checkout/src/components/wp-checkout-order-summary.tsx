import {
	getPlan,
	getYearlyPlanByMonthly,
	isChargeback,
	isCredits,
	isDomainProduct,
	isDomainTransfer,
	isGoogleWorkspace,
	isMonthly,
	isNoAds,
	isPlan,
	isTitanMail,
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPersonalPlan,
	isWpComPlan,
	isWpComPremiumPlan,
	isJetpackProduct,
	isJetpackPlan,
	isAkismetProduct,
	planHasFeature,
	WPCOM_FEATURES_ATOMIC,
	isWooExpressPlan,
	isSenseiProduct,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/format-currency';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { isNewsletterOrLinkInBioFlow, isAnyHostingFlow } from '@automattic/onboarding';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	isBillingInfoEmpty,
	getTaxBreakdownLineItemsFromCart,
	getTotalLineItemFromCart,
	getCreditsLineItemFromCart,
} from '@automattic/wpcom-checkout';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Icon, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { getAcceptedAssistedFreeMigration } from 'calypso/blocks/importer/wordpress/utils';
import { hasFreeCouponTransfersOnly } from 'calypso/lib/cart-values/cart-items';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import getAkismetProductFeatures from '../lib/get-akismet-product-features';
import getFlowPlanFeatures from '../lib/get-flow-plan-features';
import getJetpackProductFeatures from '../lib/get-jetpack-product-features';
import getPlanFeatures from '../lib/get-plan-features';
import { CheckIcon } from './check-icon';
import { ProductsAndCostOverridesList } from './cost-overrides-list';
import { getRefundPolicies, getRefundWindows, RefundPolicy } from './refund-policies';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

// This will make converting to TS less noisy. The order of components can be reorganized later
/* eslint-disable @typescript-eslint/no-use-before-define */

const StyledIcon = styled( Icon )`
	fill: '#1E1E1E';
	margin-right: 0.3em;

	.rtl & {
		margin-right: 0;
		margin-left: 0.3em;
	}
`;

export function WPCheckoutOrderSummary( {
	siteId,
	onChangeSelection,
	showFeaturesList,
}: {
	siteId: number | undefined;
	onChangeSelection: (
		uuid: string,
		productSlug: string,
		productId: number,
		volume?: number
	) => void;
	showFeaturesList?: boolean;
} ) {
	const { formStatus } = useFormStatus();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const isCartUpdating = FormStatus.VALIDATING === formStatus;

	return (
		<CheckoutSummaryCard
			className={ isCartUpdating ? 'is-loading' : '' }
			data-e2e-cart-is-loading={ isCartUpdating }
		>
			{ showFeaturesList && (
				<CheckoutSummaryFeaturedList
					responseCart={ responseCart }
					siteId={ siteId }
					isCartUpdating={ isCartUpdating }
					onChangeSelection={ onChangeSelection }
				/>
			) }
			<CheckoutSummaryPriceList />
		</CheckoutSummaryCard>
	);
}
export function CheckoutSummaryFeaturedList( {
	responseCart,
	siteId,
	isCartUpdating,
	onChangeSelection,
}: {
	responseCart: ResponseCart;
	siteId: number | undefined;
	isCartUpdating: boolean;
	onChangeSelection: (
		uuid: string,
		productSlug: string,
		productId: number,
		volume?: number
	) => void;
} ) {
	const translate = useTranslate();

	// Return early if the cart is only Chargebacks fees
	if ( responseCart.products.every( isChargeback || isCredits ) ) {
		return null;
	}

	const hasRenewalInCart = responseCart.products.some(
		( product ) => product.extra.purchaseType === 'renewal'
	);

	const isWcMobile = isWcMobileApp();

	const plan = responseCart.products.find( ( product ) => isPlan( product ) );
	const hasMonthlyPlanInCart = Boolean( plan && isMonthly( plan?.product_slug ) );

	return (
		<>
			<CheckoutSummaryFeatures>
				<CheckoutSummaryFeaturesTitle>
					{ responseCart.is_gift_purchase
						? translate( 'WordPress.com Gift Subscription' )
						: translate( 'Included with your purchase' ) }
				</CheckoutSummaryFeaturesTitle>
				<CheckoutSummaryFeaturesWrapper
					siteId={ siteId }
					nextDomainIsFree={ responseCart.next_domain_is_free }
				/>
			</CheckoutSummaryFeatures>
			{ ! isCartUpdating && ! hasRenewalInCart && ! isWcMobile && plan && hasMonthlyPlanInCart && (
				<CheckoutSummaryAnnualUpsell plan={ plan } onChangeSelection={ onChangeSelection } />
			) }
		</>
	);
}

const TaxNotCalculatedLineItemWrapper = styled.div`
	font-size: 14px;
	text-wrap: pretty;
	line-height: 1em;
`;

function TaxNotCalculatedLineItem() {
	const translate = useTranslate();
	return (
		<TaxNotCalculatedLineItemWrapper>
			{ translate( 'Tax: to be calculated', {
				textOnly: true,
			} ) }
		</TaxNotCalculatedLineItemWrapper>
	);
}

function CheckoutSummaryPriceList() {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const creditsLineItem = getCreditsLineItemFromCart( responseCart );
	const taxLineItems = getTaxBreakdownLineItemsFromCart( responseCart );
	const totalLineItem = getTotalLineItemFromCart( responseCart );
	const translate = useTranslate();

	return (
		<>
			<ProductsAndCostOverridesList responseCart={ responseCart } />
			<CheckoutSummaryAmountWrapper>
				<CheckoutSubtotalSection>
					<CheckoutSummaryLineItem key="checkout-summary-line-item-subtotal">
						<span>{ translate( 'Subtotal' ) }</span>
						<span>
							{ formatCurrency( responseCart.sub_total_integer, responseCart.currency, {
								isSmallestUnit: true,
								stripZeros: true,
							} ) }
						</span>
					</CheckoutSummaryLineItem>
					{ taxLineItems.map( ( taxLineItem ) => (
						<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + taxLineItem.id }>
							<span>{ taxLineItem.label }</span>
							<span>{ taxLineItem.formattedAmount }</span>
						</CheckoutSummaryLineItem>
					) ) }
					{ isBillingInfoEmpty( responseCart ) && <TaxNotCalculatedLineItem /> }
					{ creditsLineItem && responseCart.sub_total_integer > 0 && (
						<CheckoutSummaryLineItem key={ 'checkout-summary-line-item-' + creditsLineItem.id }>
							<span>{ creditsLineItem.label }</span>
							<span>{ creditsLineItem.formattedAmount }</span>
						</CheckoutSummaryLineItem>
					) }
				</CheckoutSubtotalSection>

				<CheckoutSummaryTotal>
					<span className="wp-checkout-order-summary__label">
						{ translate( 'Total', {
							context: 'The label of the total line item in checkout',
							textOnly: true,
						} ) }
					</span>
					<span className="wp-checkout-order-summary__total-price">
						{ totalLineItem.formattedAmount }
					</span>
				</CheckoutSummaryTotal>
			</CheckoutSummaryAmountWrapper>
		</>
	);
}

export function LoadingCheckoutSummaryFeaturesList() {
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
	onChangeSelection,
	linkText,
}: {
	plan: ResponseCartProduct;
	onChangeSelection: (
		uuid: string,
		productSlug: string,
		productId: number,
		volume?: number
	) => void;
	linkText?: React.ReactNode;
} ) {
	const translate = useTranslate();
	const handleClick = () => {
		const annualPlan = getPlan( getYearlyPlanByMonthly( plan.product_slug ) );
		if ( annualPlan ) {
			onChangeSelection?.( plan.uuid, annualPlan.getStoreSlug(), annualPlan.getProductId() );
		}
	};
	const text = linkText ?? translate( 'Switch to an annual plan and save!' );

	return <SwitchToAnnualPlanButton onClick={ handleClick }>{ text }</SwitchToAnnualPlanButton>;
}

function CheckoutSummaryFeaturesWrapper( props: {
	siteId: number | undefined;
	nextDomainIsFree: boolean;
} ) {
	const { siteId, nextDomainIsFree } = props;
	const signupFlowName = getSignupCompleteFlowName();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const planHasHostingFeature = responseCart.products.some( ( product ) =>
		planHasFeature( product.product_slug, WPCOM_FEATURES_ATOMIC )
	);
	const hasSenseiProductInCart = responseCart.products.some( ( product ) =>
		isSenseiProduct( product )
	);
	const shouldUseFlowFeatureList =
		isNewsletterOrLinkInBioFlow( signupFlowName ) ||
		hasSenseiProductInCart ||
		( isAnyHostingFlow( signupFlowName ) && planHasHostingFeature );
	const giftSiteSlug = responseCart.gift_details?.receiver_blog_slug;

	if ( responseCart.is_gift_purchase && giftSiteSlug ) {
		return <CheckoutSummaryGiftFeaturesList siteSlug={ giftSiteSlug } />;
	}

	if ( signupFlowName && shouldUseFlowFeatureList ) {
		return (
			<CheckoutSummaryFlowFeaturesList
				flowName={ signupFlowName }
				nextDomainIsFree={ nextDomainIsFree }
			/>
		);
	}

	return <CheckoutSummaryFeaturesList siteId={ siteId } nextDomainIsFree={ nextDomainIsFree } />;
}

function CheckoutSummaryGiftFeaturesList( { siteSlug }: { siteSlug: string } ) {
	const translate = useTranslate();
	return (
		<CheckoutSummaryFeaturesListWrapper>
			{ translate(
				'You are showing your appreciation for %(siteSlug)s by gifting them their next subscription.',
				{ args: { siteSlug } }
			) }
		</CheckoutSummaryFeaturesListWrapper>
	);
}

export function CheckoutSummaryRefundWindows( {
	cart,
	highlight = false,
	includeRefundIcon,
}: {
	cart: ResponseCart;
	highlight?: boolean;
	includeRefundIcon?: boolean;
} ) {
	const translate = useTranslate();

	const refundPolicies = getRefundPolicies( cart );
	const refundWindows = getRefundWindows( refundPolicies );

	if ( ! refundWindows.length || refundPolicies.includes( RefundPolicy.NonRefundable ) ) {
		return null;
	}

	const allCartItemsAreDomains = refundPolicies.every(
		( refundPolicy ) =>
			refundPolicy === RefundPolicy.DomainNameRegistration ||
			refundPolicy === RefundPolicy.DomainNameRegistrationBundled ||
			refundPolicy === RefundPolicy.DomainNameRenewal
	);

	if ( allCartItemsAreDomains ) {
		return null;
	}

	const allCartItemsAreMonthlyPlanBundle = refundPolicies.every(
		( refundPolicy ) =>
			refundPolicy === RefundPolicy.DomainNameRegistration ||
			refundPolicy === RefundPolicy.PlanMonthlyBundle
	);

	const allCartItemsArePlanOrDomainRenewals = refundPolicies.every(
		( refundPolicy ) =>
			refundPolicy === RefundPolicy.DomainNameRenewal ||
			refundPolicy === RefundPolicy.PlanMonthlyRenewal ||
			refundPolicy === RefundPolicy.PlanYearlyRenewal ||
			refundPolicy === RefundPolicy.PlanBiennialRenewal
	);

	let text: TranslateResult;

	if ( refundWindows.length === 1 ) {
		const refundWindow = refundWindows[ 0 ];
		const planBundleRefundPolicy = refundPolicies.find(
			( refundPolicy ) =>
				refundPolicy === RefundPolicy.PlanBiennialBundle ||
				refundPolicy === RefundPolicy.PlanYearlyBundle
		);
		const planProduct = cart.products.find( isPlan );

		if ( planBundleRefundPolicy ) {
			// Using plural translation because some languages have multiple plural forms and no plural-agnostic.
			text = translate(
				'%(days)d-day money back guarantee for %(product)s',
				'%(days)d-day money back guarantee for %(product)s',
				{
					count: refundWindow,
					args: {
						days: refundWindow,
						product: planProduct?.product_name ?? '',
					},
				}
			);
		} else {
			text = translate( '%(days)d-day money back guarantee', '%(days)d-day money back guarantee', {
				count: refundWindow,
				args: { days: refundWindow },
			} );
		}
	} else if ( allCartItemsAreMonthlyPlanBundle || allCartItemsArePlanOrDomainRenewals ) {
		const refundWindow = Math.max( ...refundWindows );
		const planProduct = cart.products.find( isPlan );

		text = translate(
			'%(days)d-day money back guarantee for %(product)s',
			'%(days)d-day money back guarantee for %(product)s',
			{
				count: refundWindow,
				args: {
					days: refundWindow,
					product: planProduct?.product_name ?? '',
				},
			}
		);
	} else {
		const shortestRefundWindow = Math.min( ...refundWindows );

		text = translate( '%(days)d-day money back guarantee', '%(days)d-day money back guarantee', {
			count: shortestRefundWindow,
			args: { days: shortestRefundWindow },
			comment: 'The number of days until the shortest refund window in the cart expires.',
		} );
	}

	return (
		<>
			{ includeRefundIcon && <StyledIcon icon={ reusableBlock } size={ 24 } /> }
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon id="features-list-refund-text" />
				{ highlight ? <strong>{ text }</strong> : text }
			</CheckoutSummaryFeaturesListItem>
		</>
	);
}

export function CheckoutSummaryFeaturesList( props: {
	siteId: number | undefined;
	nextDomainIsFree: boolean;
} ) {
	const { siteId, nextDomainIsFree } = props;

	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const hasDomainsInCart = responseCart.products.some(
		( product ) => isDomainProduct( product ) || isDomainTransfer( product )
	);

	const hasEmailInCart = responseCart.products.some(
		( product ) => isGoogleWorkspace( product ) || isTitanMail( product )
	);

	// Check for domains
	const domains = responseCart.products.filter(
		( product ) => isDomainProduct( product ) || isDomainTransfer( product )
	);

	// Check for Wordpress plans
	const plans = responseCart.products.filter( ( product ) => isPlan( product ) );
	const hasPlanInCart = plans.length > 0;

	// Check for Jetpack plans and products
	const jetpackPlansAndProducts = responseCart.products.filter( ( product ) => {
		return isJetpackProduct( product ) || isJetpackPlan( product );
	} );
	const hasJetpackProductOrPlan = jetpackPlansAndProducts.length > 0;

	// Check for Akismet products
	const akismetProducts = responseCart.products.filter( ( product ) =>
		isAkismetProduct( product )
	);
	const hasAkismetProduct = akismetProducts.length > 0;

	const hasSingleProduct = responseCart.products.length === 1;

	const translate = useTranslate();

	const hasNoAdsAddOn = responseCart.products.some( ( product ) => isNoAds( product ) );

	const hasDomainTransferProduct = responseCart.products.some( ( product ) =>
		isDomainTransfer( product )
	);

	const hasFreeMigrationAssistance = getAcceptedAssistedFreeMigration();

	return (
		<CheckoutSummaryFeaturesListWrapper>
			{ hasFreeMigrationAssistance && (
				<CheckoutSummaryFeaturesListItem>
					<WPCheckoutCheckIcon id="features-list-support-free-migration-assistance" />
					{ translate( 'Assisted free site migration' ) }
				</CheckoutSummaryFeaturesListItem>
			) }
			{ hasDomainsInCart &&
				domains.map( ( domain ) => {
					return <CheckoutSummaryFeaturesListDomainItem domain={ domain } key={ domain.uuid } />;
				} ) }

			{ hasSingleProduct && hasJetpackProductOrPlan && (
				<CheckoutSummaryJetpackProductFeatures product={ jetpackPlansAndProducts[ 0 ] } />
			) }

			{ hasSingleProduct && hasAkismetProduct && (
				<CheckoutSummaryAkismetProductFeatures product={ akismetProducts[ 0 ] } />
			) }

			{ hasPlanInCart && (
				<CheckoutSummaryPlanFeatures
					hasDomainsInCart={ hasDomainsInCart }
					nextDomainIsFree={ nextDomainIsFree }
				/>
			) }

			{ hasNoAdsAddOn && (
				<CheckoutSummaryFeaturesListItem>
					<WPCheckoutCheckIcon id="features-list-support-text" />
					{ translate( 'Remove ads from your site with the No Ads add-on' ) }
				</CheckoutSummaryFeaturesListItem>
			) }

			{ hasDomainTransferProduct && (
				<>
					<CheckoutSummaryFeaturesListItem>
						<WPCheckoutCheckIcon id="features-list-support-another-year" />
						{ hasFreeCouponTransfersOnly( responseCart )
							? translate( "Transfer is free and we'll pay for an extra year of registration." )
							: translate( '1-year extension on your domain' ) }
					</CheckoutSummaryFeaturesListItem>
					<CheckoutSummaryFeaturesListItem>
						<WPCheckoutCheckIcon id="features-list-support-privacy" />
						{ translate( 'Private domain registration and SSL certificate included for free' ) }
					</CheckoutSummaryFeaturesListItem>
				</>
			) }

			{ ! hasPlanInCart && hasEmailInCart && (
				<CheckoutSummaryFeaturesListItem>
					<WPCheckoutCheckIcon id="features-list-support-email" />
					{ translate( 'Fast support' ) }
				</CheckoutSummaryFeaturesListItem>
			) }

			{ ( ! hasPlanInCart || hasDomainTransferProduct ) && (
				<CheckoutSummarySupportIfAvailable
					siteId={ siteId }
					hasDomainTransferInCart={ hasDomainTransferProduct }
				/>
			) }

			<CheckoutSummaryRefundWindows cart={ responseCart } />
		</CheckoutSummaryFeaturesListWrapper>
	);
}

function CheckoutSummaryFlowFeaturesList( {
	flowName,
	nextDomainIsFree,
}: {
	flowName: string;
	nextDomainIsFree: boolean;
} ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const planInCart = responseCart.products.find( ( product ) => isPlan( product ) );
	const hasDomainsInCart = responseCart.products.some(
		( product ) => isDomainProduct( product ) || isDomainTransfer( product )
	);
	const domains = responseCart.products.filter(
		( product ) => isDomainProduct( product ) || isDomainTransfer( product )
	);
	const hasRenewalInCart = responseCart.products.some(
		( product ) => product.extra.purchaseType === 'renewal'
	);
	const planFeatures = getFlowPlanFeatures(
		flowName,
		planInCart,
		hasDomainsInCart,
		hasRenewalInCart,
		nextDomainIsFree
	);

	return (
		<CheckoutSummaryFeaturesListWrapper>
			{ hasDomainsInCart &&
				domains.map( ( domain ) => {
					return <CheckoutSummaryFeaturesListDomainItem domain={ domain } key={ domain.uuid } />;
				} ) }
			{ planFeatures.map( ( feature ) => {
				return (
					<CheckoutSummaryFeaturesListItem key={ `feature-list-${ feature.getSlug() }` }>
						<WPCheckoutCheckIcon id={ `feature-list-${ feature.getSlug() }-icon` } />
						{ feature.isHighlightedFeature ? (
							<strong>{ feature.getTitle() }</strong>
						) : (
							feature.getTitle()
						) }
					</CheckoutSummaryFeaturesListItem>
				);
			} ) }
			{ isAnyHostingFlow( flowName ) && (
				<CheckoutSummaryRefundWindows cart={ responseCart } highlight />
			) }
		</CheckoutSummaryFeaturesListWrapper>
	);
}

function CheckoutSummaryFeaturesListDomainItem( { domain }: { domain: ResponseCartProduct } ) {
	const translate = useTranslate();

	let bundledDomainText = translate(
		'{{strong}}%(domain)s{{/strong}} domain registration free for one year',
		{
			components: {
				strong: <strong />,
			},
			args: {
				domain: domain.meta,
			},
			comment: 'domain name and bundling message',
		}
	);

	if ( domain.is_included_for_100yearplan ) {
		bundledDomainText = translate( '{{strong}}%(domain)s{{/strong}} included with your plan', {
			components: {
				strong: <strong />,
			},
			args: {
				domain: domain.meta,
			},
			comment: 'domain name and bundling message for hundred year plan',
		} );
	}

	// If domain is using existing credit or bundled with cart, show bundled text.
	if ( domain.is_bundled ) {
		return (
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon id={ `feature-list-domain-item-${ domain.meta }` } />
				{ bundledDomainText }
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

function CheckoutSummaryJetpackProductFeatures( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const productFeatures = getJetpackProductFeatures( product, translate );

	return (
		<>
			{ productFeatures.map( ( feature, index ) => {
				return (
					<CheckoutSummaryFeaturesListItem key={ `feature${ index }` }>
						<WPCheckoutCheckIcon id={ `icon${ index }` } />
						{ feature }
					</CheckoutSummaryFeaturesListItem>
				);
			} ) }
		</>
	);
}

function CheckoutSummaryAkismetProductFeatures( { product }: { product: ResponseCartProduct } ) {
	const translate = useTranslate();
	const productFeatures = getAkismetProductFeatures( product, translate );

	let yearlySavingsPercentage = 0;

	// If intro offer is not present and there are only two variants, then show the yearly savings.
	if ( ! product?.introductory_offer_terms?.enabled && product?.product_variants.length === 2 ) {
		const monthlyCost = product.product_variants[ 0 ].price_before_discounts_integer;
		const yearlyCost = product.product_variants[ 1 ].price_before_discounts_integer;

		yearlySavingsPercentage = Math.round( ( 1 - yearlyCost / ( monthlyCost * 12 ) ) * 100 );
	}

	return (
		<>
			{ productFeatures.map( ( feature ) => {
				return (
					<CheckoutSummaryFeaturesListItem key={ feature }>
						<WPCheckoutCheckIcon id={ feature.replace( /[^\w]/g, '_' ) } />
						{ feature }
					</CheckoutSummaryFeaturesListItem>
				);
			} ) }

			{ yearlySavingsPercentage > 0 && (
				<CheckoutSummaryFeaturesListItem>
					<WPCheckoutCheckIcon id="yearly_savings" />
					{ translate( '%(yearlySavingsPercentage)s%% price reduction for yearly term', {
						args: {
							yearlySavingsPercentage,
						},
						comment: 'the percentage the user saves by buying yearly',
					} ) }
				</CheckoutSummaryFeaturesListItem>
			) }
		</>
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

	const showPricingGridFeatures = ! hasRenewalInCart;

	const planFeatures = getPlanFeatures(
		planInCart,
		translate,
		hasDomainsInCart,
		hasRenewalInCart,
		nextDomainIsFree,
		showPricingGridFeatures
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

function CheckoutSummarySupportIfAvailable( props: {
	siteId: number | undefined;
	hasDomainTransferInCart: boolean;
} ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const currentPlan = useSelector( ( state ) =>
		props.siteId ? getCurrentPlan( state, props.siteId ) : undefined
	);

	const currentPlanSlug = currentPlan?.productSlug;

	const isSupportAvailable =
		props.hasDomainTransferInCart ||
		( currentPlanSlug &&
			( isWpComPremiumPlan( currentPlanSlug ) ||
				isWpComBusinessPlan( currentPlanSlug ) ||
				isWpComEcommercePlan( currentPlanSlug ) ) &&
			! isMonthly( currentPlanSlug ) );

	if ( ! isSupportAvailable ) {
		return null;
	}

	if ( hasEnTranslation( 'Fast support' ) && hasEnTranslation( 'Priority support 24/7' ) ) {
		return (
			<CheckoutSummaryFeaturesListItem>
				<WPCheckoutCheckIcon id="annual-live-chat" />
				{ isWpComPremiumPlan( currentPlanSlug )
					? translate( 'Fast support' )
					: translate( 'Priority support 24/7' ) }
			</CheckoutSummaryFeaturesListItem>
		);
	}
	return (
		<CheckoutSummaryFeaturesListItem>
			<WPCheckoutCheckIcon id="annual-live-chat" />
			{ translate( 'Live chat support' ) }
		</CheckoutSummaryFeaturesListItem>
	);
}

function CheckoutSummaryAnnualUpsell( props: {
	plan: ResponseCartProduct;
	onChangeSelection: (
		uuid: string,
		productSlug: string,
		productId: number,
		volume?: number
	) => void;
} ) {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const productSlug = props.plan?.product_slug;
	if ( ! productSlug || ! isWpComPlan( productSlug ) ) {
		return null;
	}

	// Woo Express plans with introductory offer does not provide free domain.
	const shouldShowFreeDomainUpsell = ! (
		isWooExpressPlan( productSlug ) && Boolean( props.plan.introductory_offer_terms?.enabled )
	);

	return (
		<CheckoutSummaryFeaturesUpsell>
			<CheckoutSummaryFeaturesTitle>
				<SwitchToAnnualPlan
					plan={ props.plan }
					onChangeSelection={ props.onChangeSelection }
					linkText={ translate( 'Included with an annual plan' ) }
				/>
			</CheckoutSummaryFeaturesTitle>
			<CheckoutSummaryFeaturesListWrapper>
				{ shouldShowFreeDomainUpsell && (
					<CheckoutSummaryFeaturesListItem isSupported={ false }>
						<WPCheckoutCheckIcon id="annual-domain-credit" />
						{ translate( 'Free domain for one year' ) }
					</CheckoutSummaryFeaturesListItem>
				) }
				{ hasEnTranslation( 'Fast support' ) && hasEnTranslation( 'Priority support 24/7' )
					? ! isWpComPersonalPlan( productSlug ) && (
							<CheckoutSummaryFeaturesListItem isSupported={ false }>
								<WPCheckoutCheckIcon id="annual-live-chat" />
								{ isWpComPremiumPlan( productSlug )
									? translate( 'Fast support' )
									: translate( 'Priority support 24/7' ) }
							</CheckoutSummaryFeaturesListItem>
					  )
					: ! isWpComPersonalPlan( productSlug ) && (
							<CheckoutSummaryFeaturesListItem isSupported={ false }>
								<WPCheckoutCheckIcon id="annual-live-chat" />
								{ translate( 'Live chat support' ) }
							</CheckoutSummaryFeaturesListItem>
					  ) }
			</CheckoutSummaryFeaturesListWrapper>
			<SwitchToAnnualPlan plan={ props.plan } onChangeSelection={ props.onChangeSelection } />
		</CheckoutSummaryFeaturesUpsell>
	);
}

const pulse = keyframes`
	0% { opacity: 1; }

	70% { opacity: 0.25; }

	100% { opacity: 1; }
`;

const CheckoutSummaryCard = styled.div`
	border-bottom: none 0;
`;

const CheckoutSummaryFeatures = styled.div`
	padding: 24px 0;
	justify-self: flex-start;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 24px 0; ) }
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding: 24px 0; ) }
	}
`;

const CheckoutSummaryFeaturesUpsell = styled( CheckoutSummaryFeatures )`
	padding: 0 0 24px;

	& svg {
		opacity: 50%;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding: 0 0 24px;
	}
`;

const CheckoutSummaryFeaturesTitle = styled.h3`
	font-size: 16px;
	font-weight: ${ ( props ) => props.theme.weights.bold };
	line-height: 26px;
	margin-bottom: 12px;

	& button {
		font-size: 16px;
		font-weight: ${ ( props ) => props.theme.weights.bold };
		text-decoration: none;
	}
`;

const CheckoutSummaryFeaturesListWrapper = styled.ul`
	margin: 0;
	list-style: none;
	font-size: 14px;
`;

const WPCheckoutCheckIcon = styled( CheckIcon )`
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
	color: ${ ( props ) => ( props.isSupported ? 'inherit' : props.theme.colors.textColorLight ) };

	.rtl & {
		padding-right: 24px;
		padding-left: 0;
	}
`;
CheckoutSummaryFeaturesListItem.defaultProps = {
	isSupported: true,
};

const CheckoutSubtotalSection = styled.div`
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	margin-bottom: 20px;
	padding-bottom: 20px;
`;

const CheckoutSummaryAmountWrapper = styled.div`
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 20px 0;
	margin-top: 20px;
`;

const CheckoutSummaryLineItem = styled.div< { isDiscount?: boolean } >`
	display: flex;
	flex-wrap: wrap;
	font-size: 14px;
	justify-content: space-between;
	line-height: 20px;
	margin-bottom: 4px;

	color: ${ ( props ) => ( props.isDiscount ? props.theme.colors.discount : 'inherit' ) };

	.is-loading & {
		animation: ${ pulse } 1.5s ease-in-out infinite;
	}
`;

const CheckoutSummaryTotal = styled( CheckoutSummaryLineItem )`
	color: ${ ( props ) => props.theme.colors.textColorDark };
	font-weight: ${ ( props ) => props.theme.weights.bold };
	line-height: 26px;
	margin-bottom: 0px;
	font-size: 20px;

	& span {
		font-family: 'Recoleta', sans-serif;
	}

	& .wp-checkout-order-summary__label {
		font-size: 28px;
		line-height: 40px;
	}

	& .wp-checkout-order-summary__total-price {
		font-size: 40px; line-height: 44px; }
	}
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
	color: ${ ( props ) => props.theme.colors.primary };
	cursor: pointer;

	.rtl & {
		text-align: right;
	}

	&:hover {
		text-decoration: none;
	}
`;
