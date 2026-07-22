/* eslint-disable wpcalypso/jsx-classname-namespace */
import { SubscriptionBillPeriod, type CancellationFeature } from '@automattic/api-core';
import { purchaseCancelFeaturesQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import {
	isPersonal,
	isPremium,
	isBusiness,
	isEcommerce,
	isPlan,
	isComplete,
	isDomainProduct,
	isDomainRegistration,
	isDomainMapping,
	isDomainTransfer,
	isGoogleWorkspace,
	isGSuiteOrGoogleWorkspace,
	isThemePurchase,
	isJetpackProduct,
	isConciergeSession,
	isTitanMail,
	isPro,
	applyTestFiltersToPlansList,
	isWpComMonthlyPlan,
	JETPACK_BACKUP_T1_PRODUCTS,
	JETPACK_PLANS,
	JETPACK_LEGACY_PLANS,
	JETPACK_PRODUCTS_LIST,
	JETPACK_SECURITY_T1_PLANS,
	isP2Plus,
	getMonthlyPlanByYearly,
	hasMarketplaceProduct,
	isDIFMProduct,
	isAkismetProduct,
	isAkismetFreeProduct,
	isJetpackBackupT1Slug,
	isJetpackStarterPlan,
	AKISMET_UPGRADES_PRODUCTS_MAP,
	JETPACK_STARTER_UPGRADE_MAP,
	is100Year,
	isJetpackGrowthPlan,
	JETPACK_GROWTH_UPGRADE_MAP,
	PLAN_MONTHLY_PERIOD,
	PLAN_ANNUAL_PERIOD,
	PLAN_BIENNIAL_PERIOD,
	PLAN_TRIENNIAL_PERIOD,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import {
	Badge,
	Spinner,
	Button,
	Card,
	CompactCard,
	ProductIcon,
	Gridicon,
	PlanPrice,
	MaterialIcon,
} from '@automattic/components';
import { Plans, type SiteDetails } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { DOMAIN_CANCEL, SUPPORT_ROOT } from '@automattic/urls';
import { useQuery } from '@tanstack/react-query';
import { check, column, Icon, payment, reusableBlock, tool, trash, upload } from '@wordpress/icons';
import clsx from 'clsx';
import { localize, LocalizeProps, useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { Component, ComponentProps, Fragment, ReactElement, type JSX } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import AsyncLoad from 'calypso/components/async-load';
import isJetpackCrmProduct from 'calypso/components/crm-downloads/is-jetpack-crm-product';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { useIsSplitCancelRemoveEnabled } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/use-is-split-cancel-remove-enabled';
import {
	getCancelButtonCopy,
	getRemoveButtonCopy,
} from 'calypso/dashboard/me/billing-purchases/purchase-settings/get-cancel-remove-copy';
import reinstallPlugins from 'calypso/data/marketplace/reinstall-plugins-api';
import HundredYearPlanLogo from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/hundred-year-plan-step-wrapper/hundred-year-plan-logo';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedDomain, resolveDomainStatus } from 'calypso/lib/domains';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	getDomainRegistrationAgreementUrl,
	getDisplayName,
	getPartnerName,
	getRenewalPriceInSmallestUnit,
	handleRenewMultiplePurchasesClick,
	handleRenewNowClick,
	hasAmountAvailableToRefund,
	hasPaymentMethod,
	isPaidWithCredits,
	canAutoRenewBeTurnedOff,
	isExpiredAndInGracePeriod,
	isExpiredOrRemoved,
	isExpiredWithNoAutoRenewAttemptsLeft,
	isRemoved,
	isWithinRefundWindowDowngradeEligible,
	isOneTimePurchase,
	isPartnerPurchase,
	isRenewable,
	isCloseToExpiration,
	purchaseType,
	getName,
	shouldRenderMonthlyRenewalOption,
	getDIFMTieredPurchaseDetails,
	canExplicitRenew,
} from 'calypso/lib/purchases';
import { getPurchaseCancellationFlowType } from 'calypso/lib/purchases/utils';
import { hasCustomDomain } from 'calypso/lib/site/utils';
import { addQueryArgs } from 'calypso/lib/url';
import ProductLink from 'calypso/me/purchases/product-link';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import PlanRenewalMessage from 'calypso/my-sites/plans/jetpack-plans/plan-renewal-message';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import {
	getCancelPurchaseUrlFor,
	getAddNewPaymentMethodUrlFor,
} from 'calypso/my-sites/purchases/paths';
import { useSelector } from 'calypso/state';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import {
	currentUserHasFlag,
	getCurrentUser,
	getCurrentUserId,
} from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	getSitePurchases,
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
	hasLoadedSitePurchasesFromServer,
	getRenewableSitePurchases,
	willAtomicSiteRevertAfterPurchaseDeactivation,
} from 'calypso/state/purchases/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import { useGetWebsiteContentQuery } from 'calypso/state/signup/steps/website-content/hooks/use-get-website-content-query';
import {
	hasLoadedSiteDomains,
	getAllDomains,
	getDomainsBySiteId,
} from 'calypso/state/sites/domains/selectors';
import { getSite, getSiteSlug, isRequestingSites } from 'calypso/state/sites/selectors';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import { CalypsoDispatch, IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isRequestingWordAdsApprovalForSite } from 'calypso/state/wordads/approve/selectors';
import { cancelPurchase, managePurchase, purchasesRoot } from '../paths';
import PurchaseSiteHeader from '../purchases-site/header';
import {
	canEditPaymentDetails,
	getAddNewPaymentMethodPath,
	getChangePaymentMethodPath,
	isJetpackHoldingSitePurchase,
	isAkismetHoldingSitePurchase,
	isMarketplaceHoldingSitePurchase,
	isA4AHoldingSitePurchase,
	isA4ABillingDragonPurchase,
	getCancelPurchaseSurveyCompletedPreferenceKey,
} from '../utils';
import { classifyPurchaseForCopy } from './classify-purchase-for-copy';
import PurchaseNotice from './notices';
import PurchasePlanDetails from './plan-details';
import PurchaseMeta from './purchase-meta';
import type { FilteredPlan, PlanSlug } from '@automattic/calypso-products';
import type { SupportedSlugs } from '@automattic/components/src/product-icon/config';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { TracksProps } from 'calypso/lib/purchases';
import type {
	GetChangePaymentMethodUrlFor,
	GetManagePurchaseUrlFor,
	Purchase,
} from 'calypso/lib/purchases/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { Theme } from 'calypso/types';

import './style.scss';

const loadProductPlanOverlapNotices = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-product-plan-overlap-notices" */ 'calypso/blocks/product-plan-overlap-notices'
	);

export interface ManagePurchaseProps {
	cardTitle?: string;
	getAddNewPaymentMethodUrlFor?: typeof getAddNewPaymentMethodUrlFor;
	getCancelPurchaseUrlFor?: typeof getCancelPurchaseUrlFor;
	getChangePaymentMethodUrlFor?: GetChangePaymentMethodUrlFor;
	getManagePurchaseUrlFor?: GetManagePurchaseUrlFor;
	isSiteLevel?: boolean;
	purchaseListUrl?: string;
	purchaseId: number;
	redirectTo?: string;
	siteSlug: string;

	/**
	 * Note: this defaults to true.
	 */
	showHeader?: boolean;
}

export interface ManagePurchaseConnectedProps {
	isSplitCancelRemoveEnabled: boolean;
	cancellationFeatures: CancellationFeature[] | null;
	hasCustomPrimaryDomain?: boolean | null;
	hasLoadedDomains?: boolean;
	hasLoadedPurchasesFromServer: boolean;
	hasLoadedSites: boolean;
	hasCompletedCancelPurchaseSurvey: boolean | null;
	hasNonPrimaryDomainsFlag?: boolean;
	hasSetupAds?: boolean;
	isAtomicSite?: boolean | null;
	isDomainOnlySite?: boolean | null;
	isProductOwner?: boolean | null;
	willAtomicSiteRevert?: boolean;
	isPurchaseTheme?: boolean | null;
	plan: FilteredPlan | false | undefined;
	primaryDomain?: ResponseDomain | null;
	productsList: Record< string, ProductListItem >;
	purchase?: Purchase;
	purchaseAttachedTo?: Purchase | null;
	purchases?: Purchase[];
	relatedMonthlyPlanPrice: number;
	relatedMonthlyPlanSlug: string;
	renewableSitePurchases: Purchase[];
	selectedSiteId?: number | null;
	site?: SiteDetails | null;
	siteId?: number | null;
	theme: false | 0 | Theme | null | undefined;
	domainsDetails: Record< string, ResponseDomain[] >;
	currentRoute?: string;
	dispatch: CalypsoDispatch;

	// Actions

	handleRenewMultiplePurchasesClick: (
		purchases: Purchase[],
		siteSlug: string,
		options?: { redirectTo?: string; tracksProps?: TracksProps }
	) => void;
	handleRenewNowClick: (
		purchase: Purchase,
		siteSlug: string,
		options?: { redirectTo?: string; tracksProps?: TracksProps }
	) => void;
	errorNotice: ( message: string, options?: { duration?: number } ) => void;
	successNotice: ( message: string, options?: { duration?: number } ) => void;
}

interface ManagePurchaseState {
	isRemoving: boolean;
	isCancelSurveyVisible: boolean;
	isReinstalling: boolean;
}

// Map the purchase's billing term to the plan grid's `intervalType` param so the
// Stepper grid opens on the same term as the current plan. Downgrades only work
// within the same term, and the grid hides the term selector in the downgrade flow.
function getPlanGridIntervalType( billPeriodDays: number ): string | undefined {
	switch ( billPeriodDays ) {
		case PLAN_MONTHLY_PERIOD:
			return 'monthly';
		case PLAN_ANNUAL_PERIOD:
			return 'yearly';
		case PLAN_BIENNIAL_PERIOD:
			return '2yearly';
		case PLAN_TRIENNIAL_PERIOD:
			return '3yearly';
		default:
			return undefined;
	}
}

class ManagePurchase extends Component<
	ManagePurchaseProps & ManagePurchaseConnectedProps & LocalizeProps,
	ManagePurchaseState
> {
	state = {
		isRemoving: false,
		isCancelSurveyVisible: false,
		isReinstalling: false,
	};

	componentDidMount() {
		if ( ! this.isDataValid() ) {
			page.redirect( this.props.purchaseListUrl ?? purchasesRoot );
			return;
		}
	}

	componentDidUpdate(
		prevProps: ManagePurchaseProps & ManagePurchaseConnectedProps & LocalizeProps
	) {
		if ( this.isDataValid( prevProps ) && ! this.isDataValid() ) {
			page.redirect( this.props.purchaseListUrl ?? purchasesRoot );
			return;
		}
	}

	isDataLoading( props = this.props ) {
		return ! props.hasLoadedSites || ! props.hasLoadedPurchasesFromServer;
	}

	isDataValid( props = this.props ) {
		if ( this.isDataLoading( props ) ) {
			return true;
		}

		return Boolean( props.purchase );
	}

	handleRenew = () => {
		const { purchase, siteSlug, redirectTo } = this.props;

		if ( ! purchase ) {
			return;
		}

		const options = redirectTo ? { redirectTo } : undefined;
		const isSitelessRenewal =
			isAkismetHoldingSitePurchase( purchase ) ||
			isMarketplaceHoldingSitePurchase( purchase ) ||
			isA4AHoldingSitePurchase( purchase );

		// If this renewal is for a siteless purchase, we'll drop the site slug
		this.props.handleRenewNowClick( purchase, ! isSitelessRenewal ? siteSlug : '', options );
	};

	handleRenewMonthly = () => {
		const { relatedMonthlyPlanSlug, siteSlug, redirectTo } = this.props;
		// Track the Renew Monthly submit.
		recordTracksEvent( 'calypso_purchases_renew_monthly_click', {
			product_slug: relatedMonthlyPlanSlug,
		} );

		// Redirect to the checkout page with the monthly plan in cart
		const checkoutUrlArgs: { redirect_to?: string } = {};
		if ( redirectTo ) {
			checkoutUrlArgs.redirect_to = redirectTo;
		}
		const checkoutUrlWithArgs = addQueryArgs(
			checkoutUrlArgs,
			`/checkout/${ relatedMonthlyPlanSlug }/${ siteSlug || '' }`
		);
		page( checkoutUrlWithArgs );
	};

	handleRenewMultiplePurchases = ( purchases: Purchase[] ) => {
		const { siteSlug, redirectTo } = this.props;
		const options = redirectTo ? { redirectTo } : undefined;
		this.props.handleRenewMultiplePurchasesClick( purchases, siteSlug, options );
	};

	isPendingDomainRegistration( purchase: Purchase ): boolean {
		if ( ! isDomainRegistration( purchase ) ) {
			return false;
		}
		const domain = this.props.domainsDetails[ purchase.siteId ].find(
			( domain ) => domain.name === purchase.meta
		);
		return domain?.pendingRegistrationAtRegistry ?? false;
	}

	renderRenewButton() {
		const { purchase, translate } = this.props;
		if ( ! purchase ) {
			return null;
		}
		if (
			( isPartnerPurchase( purchase ) && ! isA4ABillingDragonPurchase( purchase ) ) ||
			! isRenewable( purchase ) ||
			( ! this.props.site &&
				! isAkismetHoldingSitePurchase( purchase ) &&
				! isMarketplaceHoldingSitePurchase( purchase ) &&
				! isA4ABillingDragonPurchase( purchase ) ) ||
			isAkismetFreeProduct( purchase ) ||
			( is100Year( purchase ) && ! isCloseToExpiration( purchase ) )
		) {
			return null;
		}

		if ( ! canExplicitRenew( purchase ) ) {
			return null;
		}

		if ( this.isPendingDomainRegistration( purchase ) ) {
			return null;
		}

		return (
			<Button
				primary
				className="manage-purchase__renew-button"
				onClick={ this.handleRenew }
				compact
			>
				{ translate( 'Renew now' ) }
			</Button>
		);
	}

	renderUpgradeButton( preventRenewal: boolean ) {
		const { purchase, translate } = this.props;
		if ( ! purchase ) {
			return null;
		}

		if ( isPartnerPurchase( purchase ) || isA4ABillingDragonPurchase( purchase ) ) {
			return null;
		}

		const isUpgradeablePlan =
			isPlan( purchase ) &&
			! isEcommerce( purchase ) &&
			! isPro( purchase ) &&
			! isComplete( purchase ) &&
			! is100Year( purchase ) &&
			! isP2Plus( purchase );
		const isUpgradeableProduct =
			! isPlan( purchase ) &&
			( isJetpackBackupT1Slug( purchase.productSlug ) || isAkismetProduct( purchase ) );

		if ( ! isUpgradeablePlan && ! isUpgradeableProduct ) {
			return null;
		}

		if ( isExpiredOrRemoved( purchase ) ) {
			return null;
		}

		const upgradeUrl = this.getUpgradeUrl();

		if ( ! upgradeUrl ) {
			return null;
		}

		// If the "renew now" button is showing, it will be using primary styles
		// Show the upgrade button without the primary style if both buttons are present
		return (
			<Button primary={ !! preventRenewal } compact href={ upgradeUrl }>
				{ translate( 'Upgrade' ) }
			</Button>
		);
	}

	renderRenewalNavItem( content: JSX.Element | string, onClick: () => void ) {
		const { purchase } = this.props;
		if ( ! purchase ) {
			return null;
		}

		if (
			( isPartnerPurchase( purchase ) && ! isA4ABillingDragonPurchase( purchase ) ) ||
			! isRenewable( purchase ) ||
			( ! this.props.site &&
				! isAkismetHoldingSitePurchase( purchase ) &&
				! isMarketplaceHoldingSitePurchase( purchase ) &&
				! isA4ABillingDragonPurchase( purchase ) ) ||
			isAkismetFreeProduct( purchase )
		) {
			return null;
		}

		if ( ! canExplicitRenew( purchase ) ) {
			return null;
		}

		return (
			<CompactCard tagName="button" displayAsLink onClick={ onClick }>
				<Icon icon={ reusableBlock } className="card__icon" />
				{ content }
			</CompactCard>
		);
	}

	renderRenewNowNavItem() {
		const { translate } = this.props;
		return this.renderRenewalNavItem( translate( 'Renew now' ), this.handleRenew );
	}

	renderRenewAnnuallyNavItem() {
		const { translate, purchase, relatedMonthlyPlanPrice } = this.props;
		if ( ! purchase ) {
			return null;
		}

		const billPeriodDays = purchase.billPeriodDays;
		const isAnnualRenewal = billPeriodDays === SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD;

		if ( isAnnualRenewal ) {
			const annualPrice = getRenewalPriceInSmallestUnit( purchase ) / 12;
			const savings = Math.floor(
				( 100 * ( relatedMonthlyPlanPrice - annualPrice ) ) / relatedMonthlyPlanPrice
			);
			return this.renderRenewalNavItem(
				<div>
					{ translate( 'Renew annually' ) }
					<Badge className="manage-purchase__savings-badge" type="success">
						{ translate( '%(savings)d%% cheaper than monthly', {
							args: {
								savings,
							},
						} ) }
					</Badge>
				</div>,
				this.handleRenew
			);
		}

		// All other use cases (monthly, biennially, triennially_)
		return this.renderRenewButton();
	}

	renderRenewMonthlyNavItem() {
		const { translate } = this.props;
		return this.renderRenewalNavItem( translate( 'Renew monthly' ), this.handleRenewMonthly );
	}

	handleUpgradeClick = () => {
		const { purchase } = this.props;
		if ( ! purchase ) {
			return null;
		}

		recordTracksEvent( 'calypso_purchases_upgrade_plan', {
			status: isExpiredOrRemoved( purchase ) ? 'expired' : 'active',
			plan: purchase.productName,
		} );
	};

	getUpgradeUrl() {
		const { purchase, siteSlug } = this.props;
		if ( ! purchase ) {
			return null;
		}

		const isUpgradeableBackupProduct = (
			JETPACK_BACKUP_T1_PRODUCTS as ReadonlyArray< string >
		 ).includes( purchase.productSlug );
		const isUpgradeableSecurityPlan = (
			JETPACK_SECURITY_T1_PLANS as ReadonlyArray< string >
		 ).includes( purchase.productSlug );

		if ( isAkismetProduct( purchase ) ) {
			// For the first Iteration of Calypso Akismet checkout we are only suggesting
			// for immediate upgrades to the next plan. We will change this in the future
			// with appropriate page.
			if ( AKISMET_UPGRADES_PRODUCTS_MAP.hasOwnProperty( purchase.productSlug ) ) {
				return AKISMET_UPGRADES_PRODUCTS_MAP[
					purchase.productSlug as keyof typeof AKISMET_UPGRADES_PRODUCTS_MAP
				];
			}

			return null;
		}

		if ( isJetpackGrowthPlan( purchase.productSlug ) ) {
			const upgradePlan =
				JETPACK_GROWTH_UPGRADE_MAP[
					purchase.productSlug as keyof typeof JETPACK_GROWTH_UPGRADE_MAP
				];
			return `/checkout/${ siteSlug }/${ upgradePlan }`;
		}

		if ( isJetpackStarterPlan( purchase.productSlug ) ) {
			const upgradePlan =
				JETPACK_STARTER_UPGRADE_MAP[
					purchase.productSlug as keyof typeof JETPACK_STARTER_UPGRADE_MAP
				];
			return `/checkout/${ siteSlug }/${ upgradePlan }`;
		}

		if ( isUpgradeableBackupProduct || isUpgradeableSecurityPlan ) {
			return `/plans/storage/${ siteSlug }`;
		}

		return `/plans/${ siteSlug }`;
	}

	shouldRenderDowngradeOption(): boolean {
		const { purchase } = this.props;
		if ( ! purchase || ! isPlan( purchase ) ) {
			return false;
		}
		if ( ! purchase.isPlanTypeDowngradable ) {
			return false;
		}
		const expiredOrRefundDowngrade =
			config.isEnabled( 'plans/expired-downgrade' ) &&
			( isExpiredAndInGracePeriod( purchase ) ||
				isWithinRefundWindowDowngradeEligible( purchase ) );
		const delayedDowngrade = config.isEnabled( 'plans/delayed-downgrade' );
		return expiredOrRefundDowngrade || delayedDowngrade;
	}

	renderChangePlanNavItem() {
		const { purchase, siteSlug, getManagePurchaseUrlFor = managePurchase, translate } = this.props;
		if ( ! this.shouldRenderDowngradeOption() || ! purchase ) {
			return null;
		}
		// Route to the Stepper plan-upgrade flow, whose plan grid and downgrade
		// dialog are more polished than the classic `/plans` page. The downgrade
		// logic itself is shared (both pages render `PlansFeaturesMain`), and it
		// reads `redirect_to`/`cancel_to` straight off the URL, so we still land
		// back on this manage-purchase page afterwards. The `:purchaseId`
		// placeholder is substituted with the newly-provisioned plan's purchase by
		// either the instant-downgrade handler or the checkout pending page
		// (analogous to `:receiptId`).
		const redirectTo = getManagePurchaseUrlFor( siteSlug, ':purchaseId' ) + '?plan_changed=true';
		const cancelTo = getManagePurchaseUrlFor( siteSlug, purchase.id );
		const intervalType = getPlanGridIntervalType( purchase.billPeriodDays );
		const href = addQueryArgs(
			{
				siteSlug,
				allow_downgrade: 'true',
				redirect_to: redirectTo,
				cancel_to: cancelTo,
				...( intervalType && { intervalType } ),
			},
			'/setup/plan-upgrade'
		);
		return (
			<CompactCard tagName="a" displayAsLink href={ href }>
				<Icon icon={ column } className="card__icon" />
				{ translate( 'Change plan' ) }
			</CompactCard>
		);
	}

	renderUpgradeNavItem() {
		const { purchase, translate } = this.props;
		if ( this.shouldRenderDowngradeOption() ) {
			return null;
		}
		if ( ! purchase ) {
			return null;
		}
		if (
			isJetpackHoldingSitePurchase( purchase ) ||
			isPartnerPurchase( purchase ) ||
			isA4ABillingDragonPurchase( purchase )
		) {
			return null;
		}

		const isUpgradeablePlan =
			purchase &&
			isPlan( purchase ) &&
			! isEcommerce( purchase ) &&
			! isPro( purchase ) &&
			! isComplete( purchase ) &&
			! isP2Plus( purchase ) &&
			! is100Year( purchase );

		const isUpgradeableBackupProduct = (
			JETPACK_BACKUP_T1_PRODUCTS as ReadonlyArray< string >
		 ).includes( purchase.productSlug );
		const isUpgradeableProduct = isUpgradeableBackupProduct;

		if ( ! isUpgradeablePlan && ! isUpgradeableProduct ) {
			return null;
		}

		let icon;
		let buttonText;

		if ( isExpiredOrRemoved( purchase ) ) {
			icon = column;
			buttonText = isUpgradeablePlan
				? translate( 'Pick another plan' )
				: translate( 'Pick another product' );
		} else {
			icon = upload;
			buttonText = isUpgradeablePlan ? translate( 'Upgrade plan' ) : translate( 'Upgrade product' );
		}

		const upgradeUrl = this.getUpgradeUrl();

		return (
			<CompactCard
				tagName="button"
				displayAsLink
				href={ upgradeUrl }
				onClick={ this.handleUpgradeClick }
			>
				<Icon icon={ icon } className="card__icon" />
				{ buttonText }
			</CompactCard>
		);
	}

	handleEditPaymentMethodNavItem = () => {
		recordTracksEvent( 'calypso_purchases_edit_payment_method' );
	};

	getDomainDetailsFromPurchase = ( purchase: Purchase ): ResponseDomain | undefined => {
		return this.props.domainsDetails?.[ purchase.siteId ]?.find(
			( domain ) => domain.domain === purchase.meta
		);
	};

	isHundredYearDomain = ( purchase: Purchase ): boolean | undefined => {
		const domainDetails = this.getDomainDetailsFromPurchase( purchase );
		return domainDetails?.isHundredYearDomain;
	};

	renderEditPaymentMethodNavItem() {
		const { purchase, translate, siteSlug, getChangePaymentMethodUrlFor } = this.props;
		if ( ! purchase ) {
			return null;
		}

		if ( isPartnerPurchase( purchase ) && ! isA4ABillingDragonPurchase( purchase ) ) {
			return null;
		}

		if (
			! this.props.site &&
			! isAkismetHoldingSitePurchase( purchase ) &&
			! isMarketplaceHoldingSitePurchase( purchase ) &&
			! isA4ABillingDragonPurchase( purchase )
		) {
			return null;
		}

		if ( this.isHundredYearDomain( purchase ) ) {
			return null;
		}

		if ( canEditPaymentDetails( purchase ) ) {
			const path = ( getChangePaymentMethodUrlFor ?? getChangePaymentMethodPath )(
				siteSlug,
				purchase
			);

			return (
				<CompactCard href={ path } onClick={ this.handleEditPaymentMethodNavItem }>
					<Icon icon={ payment } className="card__icon" />
					{ addPaymentMethodLinkText( { purchase, translate } ) }
				</CompactCard>
			);
		}

		return null;
	}

	renderCrmDownloadsNavItem() {
		const { purchase, translate } = this.props;

		// Only show for Jetpack CRM Products
		if ( ! isJetpackCrmProduct( purchase?.productSlug ) ) {
			return null;
		}

		const handleCrmDownloadsClick = () => {
			recordTracksEvent( 'calypso_purchases_crm_downloads_click', {
				product_slug: purchase?.productSlug || '',
			} );
		};

		// We'll pass the purchase ID in the URL, and the CRM Downloads component will fetch the actual license key
		const path = `/purchases/crm-downloads/${ purchase?.id }`;

		return (
			<CompactCard href={ path } onClick={ handleCrmDownloadsClick }>
				<MaterialIcon icon="person" className="card__icon" />
				{ translate( 'CRM Downloads' ) }
			</CompactCard>
		);
	}

	renderActionDetailsText(
		translatedActionDetails: string,
		props?: ComponentProps< 'span' >
	): ReactElement {
		return <span { ...props }>{ translatedActionDetails }</span>;
	}

	renderRemovePurchaseNavItem() {
		const { purchase } = this.props;
		if ( ! purchase ) {
			return null;
		}

		const canRefund = hasAmountAvailableToRefund( purchase );
		const autoRenewOn = !! purchase.isAutoRenewEnabled;

		// Show Remove when auto-renew is off, OR when the purchase is in its
		// post-expiry grace period (Cancel is not offered there, so Remove is the
		// only way to act on it — matching the Dashboard). The refund-eligible case
		// is surfaced inside the cancel flow via RefundEligibilityNotice instead of
		// a parallel Remove CTA.
		if ( autoRenewOn && ! isExpiredAndInGracePeriod( purchase ) ) {
			return null;
		}

		// 100-year plans and domains can't be removed via self-serve.
		if ( is100Year( purchase ) ) {
			return null;
		}
		if ( isDomainRegistration( purchase ) && this.isHundredYearDomain( purchase ) ) {
			return null;
		}

		const removeCopy = getRemoveButtonCopy( {
			category: classifyPurchaseForCopy( purchase ),
			productName: purchase.productName,
			hasRefund: canRefund,
		} );

		// All removes route through the unified confirmation screen via
		// ?intent=remove. isDataValid on the cancel page accepts any intent=remove
		// purchase, so non-refundable and domain removes both land on the
		// confirmation screen correctly.
		const baseLink = ( this.props.getCancelPurchaseUrlFor ?? cancelPurchase )(
			this.props.siteSlug,
			purchase.id
		);
		const link = `${ baseLink }?intent=remove`;
		return (
			<CompactCard href={ link } className="remove-purchase__card">
				<Icon icon={ trash } className="card__icon" />
				{ removeCopy.label }
				{ this.renderActionDetailsText( removeCopy.description, {
					className: 'manage-purchase__refund-text',
				} ) }
			</CompactCard>
		);
	}

	showPreCancellationModalDialog = () => {
		this.setState( {
			isRemoving: false,
			isCancelSurveyVisible: true,
		} );
	};

	closeDialog = () => {
		this.setState( {
			isRemoving: false,
			isCancelSurveyVisible: false,
		} );
	};

	renderCancelSurvey() {
		const { purchase } = this.props;
		if ( ! purchase ) {
			return null;
		}

		return (
			<CancelPurchaseForm
				disableButtons={ this.state.isRemoving }
				purchase={ purchase }
				linkedPurchases={ this.getActiveMarketplaceSubscriptions() }
				isVisible={ this.state.isCancelSurveyVisible }
				onClose={ this.closeDialog }
				onSurveyComplete={ this.cancelSubscription }
				flowType={ getPurchaseCancellationFlowType( purchase ) }
			/>
		);
	}

	handleReinstall = async () => {
		this.setState( { isReinstalling: true } );
		if ( ! this.props.purchase ) {
			return null;
		}
		const siteId = this.props.purchase.siteId;
		try {
			const response = await reinstallPlugins( siteId );

			this.props.successNotice( response.message, { duration: 5000 } );
		} catch ( error ) {
			this.props.errorNotice( ( error as Error ).message );
		} finally {
			this.setState( { isReinstalling: false } );
		}
	};

	renderReinstall() {
		const { purchase, productsList, translate } = this.props;
		const { isReinstalling } = this.state;
		if ( ! purchase ) {
			return null;
		}

		if ( ! hasMarketplaceProduct( productsList, purchase.productSlug ) ) {
			return null;
		}

		if ( isMarketplaceHoldingSitePurchase( purchase ) ) {
			return null;
		}

		return (
			<CompactCard tagName="a" onClick={ isReinstalling ? null : this.handleReinstall }>
				{ isReinstalling ? (
					<>
						<Spinner className="card__icon" />
						{ translate( 'Reinstalling…' ) }
					</>
				) : (
					<>
						<Icon icon={ tool } className="card__icon" />
						{ translate( 'Reinstall' ) }
					</>
				) }
			</CompactCard>
		);
	}

	cancelSubscription = () => {
		this.closeDialog();
		page.redirect( this.props.purchaseListUrl ?? purchasesRoot );
		return;
	};

	renderCancelPurchaseNavItem() {
		const { isAtomicSite, purchase } = this.props;
		if ( ! purchase ) {
			return null;
		}
		const { id } = purchase;

		if ( ! canAutoRenewBeTurnedOff( purchase ) ) {
			return null;
		}

		// Only show the Cancel button when auto-renew is still on (i.e. the user
		// hasn't already cancelled the subscription). The Remove button owns the
		// auto-renew-off state. `canAutoRenewBeTurnedOff` returns true for
		// refundable purchases even when auto-renew is already off, so the explicit
		// `isAutoRenewEnabled` check is needed.
		if ( ! purchase.isAutoRenewEnabled ) {
			return null;
		}

		const baseLink = ( this.props.getCancelPurchaseUrlFor ?? cancelPurchase )(
			this.props.siteSlug,
			id
		);
		// Carry the user's intent through to the confirmation screen so it renders
		// the matching variant: the "Cancel" CTA always means cancel (disable
		// auto-renew, keep features until expiry), distinct from the "Remove and
		// refund" action offered by the refund-eligibility notice (intent=remove).
		const link = `${ baseLink }?intent=cancel`;
		const canRefund = hasAmountAvailableToRefund( purchase );

		if ( ! canRefund && isDomainTransfer( purchase ) ) {
			return null;
		}

		// 100-year plans and domains can't be cancelled via self-serve.
		if ( is100Year( purchase ) ) {
			return null;
		}
		if ( this.isHundredYearDomain( purchase ) ) {
			return null;
		}

		const expiryDateDisplay = moment( purchase.expiryDate ).format( 'LL' );
		// Use non-breaking spaces so the formatted date stays on one line in narrow
		// viewports.
		const cancelCopy = getCancelButtonCopy( {
			category: classifyPurchaseForCopy( purchase ),
			productName: purchase.productName,
			expiryDateFormatted: expiryDateDisplay.replace( / /g, '\u00A0' ),
		} );

		const onClick = () => {
			recordTracksEvent( 'calypso_purchases_manage_purchase_cancel_click', {
				product_slug: purchase.productSlug,
				is_atomic: isAtomicSite,
				link_text: cancelCopy.label,
			} );
		};

		return (
			<CompactCard href={ link } className="remove-purchase__card" onClick={ onClick }>
				<Icon icon={ trash } className="card__icon" />
				{ cancelCopy.label }
				{ this.renderActionDetailsText( cancelCopy.description, {
					className: 'manage-purchase__refund-text',
				} ) }
			</CompactCard>
		);
	}

	renderPurchaseIcon() {
		const { purchase, translate } = this.props;
		if ( ! purchase ) {
			return null;
		}

		if ( isPlan( purchase ) || isJetpackProduct( purchase ) ) {
			return (
				<div className="manage-purchase__plan-icon">
					<ProductIcon slug={ purchase.productSlug as SupportedSlugs } />
				</div>
			);
		}

		if ( this.isHundredYearDomain( purchase ) ) {
			return (
				<div className="manage-purchase__plan-icon">
					<HundredYearPlanLogo width={ 60 } />
				</div>
			);
		}

		if ( isDomainProduct( purchase ) || isDomainTransfer( purchase ) ) {
			return (
				<div className="manage-purchase__plan-icon">
					<Gridicon icon="domains" size={ 54 } />
				</div>
			);
		}

		if ( isGoogleWorkspace( purchase ) ) {
			return (
				<div className="manage-purchase__plan-icon">
					<img src={ googleWorkspaceIcon } alt={ translate( 'Google Workspace icon' ) } />
				</div>
			);
		}

		if ( isThemePurchase( purchase ) ) {
			return (
				<div className="manage-purchase__plan-icon">
					<Gridicon icon="themes" size={ 54 } />
				</div>
			);
		}

		if ( isTitanMail( purchase ) ) {
			return (
				<div className="manage-purchase__plan-icon">
					<Gridicon icon="my-sites" size={ 54 } />
				</div>
			);
		}

		return null;
	}

	getPurchaseDescription() {
		const { plan, purchase, theme, translate } = this.props;
		if ( ! purchase ) {
			return null;
		}

		if ( isPlan( purchase ) && plan ) {
			return plan.getDescription();
		}

		if ( isThemePurchase( purchase ) && theme ) {
			return theme.description;
		}

		if ( isConciergeSession( purchase ) ) {
			return purchase.description;
		}

		if ( isDomainMapping( purchase ) || isDomainRegistration( purchase ) ) {
			if ( this.isHundredYearDomain( purchase ) ) {
				return translate(
					'Your stories, achievements, and memories preserved for generations to come. One payment. One hundred years of legacy.'
				);
			}

			return translate(
				"When used with a paid plan, your custom domain can replace your site's free address, {{strong}}%(wpcom_url)s{{/strong}}, " +
					'with {{strong}}%(domain)s{{/strong}}, making it easier to remember and easier to share.',
				{
					args: {
						domain: purchase.meta as string,
						wpcom_url: purchase.domain,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		}

		if ( isDomainTransfer( purchase ) ) {
			const { currentRoute, site, translate, dispatch } = this.props;

			const transferDomain = this.getDomainDetailsFromPurchase( purchase );

			if ( transferDomain ) {
				const { noticeText } = resolveDomainStatus( transferDomain, null, translate, dispatch, {
					siteSlug: site?.slug,
					getMappingErrors: true,
					currentRoute,
				} );
				if ( noticeText ) {
					return noticeText;
				}

				return translate(
					'Transfers an existing domain from another provider to WordPress.com, ' +
						'helping you manage your site and domain in one place.'
				);
			}
		}

		if ( isGSuiteOrGoogleWorkspace( purchase ) || isTitanMail( purchase ) ) {
			const description = isTitanMail( purchase )
				? translate(
						'Integrated email solution with powerful features. Manage your email and more on any device.'
				  )
				: translate(
						'Business email with Gmail. Includes other collaboration and productivity tools from Google.'
				  );

			if ( purchase.purchaseRenewalQuantity ) {
				return (
					<>
						{ description }{ ' ' }
						{ translate(
							'This purchase is for %(numberOfMailboxes)d mailbox for the domain %(domain)s.',
							'This purchase is for %(numberOfMailboxes)d mailboxes for the domain %(domain)s.',
							{
								count: purchase.purchaseRenewalQuantity,
								args: {
									numberOfMailboxes: purchase.purchaseRenewalQuantity,
									domain: purchase.meta as string,
								},
							}
						) }
					</>
				);
			}
			return description;
		}

		if ( isDIFMProduct( purchase ) ) {
			return <BBEPurchaseDescription purchase={ purchase } />;
		}

		return purchaseType( purchase );
	}

	renderPurchaseDescription() {
		const { purchase, site, translate, isSplitCancelRemoveEnabled, cancellationFeatures } =
			this.props;

		if ( ! purchase ) {
			return null;
		}

		if ( isMarketplaceHoldingSitePurchase( purchase ) || isA4AHoldingSitePurchase( purchase ) ) {
			return null;
		}

		// When the split flag is on and the API has returned features for this
		// purchase, show the feature list instead of the description.
		if ( isSplitCancelRemoveEnabled && cancellationFeatures && cancellationFeatures.length > 0 ) {
			return (
				<div className="manage-purchase__content">
					<ul className="manage-purchase__feature-list-items">
						{ cancellationFeatures.map( ( feature ) => (
							<li key={ feature.feature_id } className="manage-purchase__feature-list-item">
								<Icon icon={ check } size={ 24 } className="manage-purchase__feature-icon" />
								<span>{ feature.title }</span>
							</li>
						) ) }
					</ul>
				</div>
			);
		}

		const registrationAgreementUrl = getDomainRegistrationAgreementUrl( purchase );
		const domainRegistrationAgreementLinkText = translate( 'Domain Registration Agreement' );

		const helpOptions = {
			components: {
				strong: <strong />,
				a: <a href={ localizeUrl( SUPPORT_ROOT ) } rel="noopener noreferrer" target="_blank" />,
			},
		};

		const cancelOptions = {
			components: {
				strong: <strong />,
				a: <a href={ localizeUrl( DOMAIN_CANCEL ) } rel="noopener noreferrer" target="_blank" />,
			},
		};
		const supportText = translate(
			'Need help? {{a}}Get in touch with one of our Happiness Engineers{{/a}}.',
			helpOptions
		);

		const cancelText = translate(
			'Cancel Domain and Refund? Please {{a}}click here.{{/a}}',
			cancelOptions
		);

		const domainTransferDuration = translate(
			'Domain transfers can take anywhere from five to seven days to complete.'
		);

		return (
			<div className="manage-purchase__content">
				<span className="manage-purchase__description">
					<div className="manage-purchase__content-domain-description">
						{ this.getPurchaseDescription() }
					</div>
					<div className="manage-purchase__content-domain-description">
						{ purchase.productType === 'domain_transfer' && (
							<>
								{ cancelText } { domainTransferDuration }
							</>
						) }
					</div>
					<div className="manage-purchase__content-domain-description">
						{ purchase.productType === 'domain_transfer' && supportText }
					</div>
				</span>

				<span className="manage-purchase__settings-link">
					{ ! isJetpackCloud() && site && (
						<ProductLink purchase={ purchase } selectedSite={ site } />
					) }
				</span>

				{ registrationAgreementUrl && (
					<a href={ registrationAgreementUrl } target="_blank" rel="noopener noreferrer">
						{ domainRegistrationAgreementLinkText }
					</a>
				) }
			</div>
		);
	}

	renderPlaceholder() {
		const {
			siteSlug,
			hasLoadedPurchasesFromServer,
			getManagePurchaseUrlFor,
			getChangePaymentMethodUrlFor,
		} = this.props;

		return (
			<Fragment>
				<PurchaseSiteHeader isPlaceholder />
				<Card className="manage-purchase__info is-placeholder">
					<header className="manage-purchase__header">
						<div className="manage-purchase__plan-icon" />
						<strong className="manage-purchase__title" />
						<span className="manage-purchase__subtitle" />
					</header>
					<div className="manage-purchase__content">
						<span className="manage-purchase__description" />
						<span className="manage-purchase__settings-link" />
					</div>

					<PurchaseMeta
						purchaseId={ false }
						siteSlug={ siteSlug }
						hasLoadedPurchasesFromServer={ hasLoadedPurchasesFromServer }
						getManagePurchaseUrlFor={ getManagePurchaseUrlFor ?? managePurchase }
						getChangePaymentMethodUrlFor={
							getChangePaymentMethodUrlFor ?? getChangePaymentMethodPath
						}
					/>
				</Card>
				<PurchasePlanDetails isPlaceholder purchaseId={ 0 } />
				<VerticalNavItem isPlaceholder />
				<VerticalNavItem isPlaceholder />
			</Fragment>
		);
	}

	isDomainsLoading( props: ManagePurchaseProps & ManagePurchaseConnectedProps ) {
		const { purchase, hasLoadedDomains } = props;
		if ( purchase ) {
			if ( ! isDomainProduct( purchase ) || isDomainTransfer( purchase ) ) {
				return false;
			}
		}

		return ! hasLoadedDomains;
	}

	getProductDisplayName() {
		const { purchase, plan, translate } = this.props;

		if ( ! purchase ) {
			return '';
		}

		if ( ! plan || ! isWpComMonthlyPlan( purchase.productSlug ) ) {
			return getDisplayName( purchase );
		}

		return translate( '%s Monthly', {
			args: getDisplayName( purchase ),
			comment: '%s will be a dotcom plan name. e.g. WordPress.com Business Monthly',
		} );
	}

	getActiveMarketplaceSubscriptions() {
		const { purchase, purchases, productsList } = this.props;

		if ( ! purchase || ! purchases || ! isPlan( purchase ) ) {
			return [];
		}

		return purchases.filter( ( _purchase ) =>
			hasMarketplaceProduct( productsList, _purchase.productSlug )
		);
	}

	renderPurchaseDetail( preventRenewal: boolean ) {
		if ( this.isDataLoading( this.props ) || this.isDomainsLoading( this.props ) ) {
			return this.renderPlaceholder();
		}

		const {
			purchase,
			translate,
			isProductOwner,
			getManagePurchaseUrlFor,
			siteSlug,
			getChangePaymentMethodUrlFor,
			hasLoadedPurchasesFromServer,
		} = this.props;

		if ( ! purchase ) {
			return this.renderPlaceholder();
		}

		const isActive100YearPurchase = is100Year( purchase ) && ! isCloseToExpiration( purchase );

		const classes = clsx( 'manage-purchase__info', {
			// Style the purchase as expired only once it is removed, or once its
			// post-expiry grace period ends with no auto-renewal attempts left.
			// While attempts remain it is still recoverable (the user can fix the
			// payment method and/or turn auto-renew back on, and the toggle is shown
			// in that state), so we do not style it as dead.
			'is-expired': isRemoved( purchase ) || isExpiredWithNoAutoRenewAttemptsLeft( purchase ),
			'is-personal': isPersonal( purchase ),
			'is-premium': isPremium( purchase ),
			'is-business': isBusiness( purchase ),
			'is-jetpack-product': isJetpackProduct( purchase ),
		} );
		const siteName = purchase.siteName;
		const siteId = purchase.siteId;

		const renderMonthlyRenewalOption = shouldRenderMonthlyRenewalOption( purchase );
		const isHundredYearDomain = this.isHundredYearDomain( purchase );

		return (
			<Fragment>
				{ ( this.props.showHeader ?? true ) && (
					<PurchaseSiteHeader siteId={ siteId } name={ siteName } purchase={ purchase } />
				) }
				<Card className={ classes }>
					<header className="manage-purchase__header">
						{ this.renderPurchaseIcon() }
						<div className="manage-purchase__header-content">
							<h2 className="manage-purchase__title">{ this.getProductDisplayName() }</h2>
							<div className="manage-purchase__description">
								{ isHundredYearDomain
									? translate( '100-Year Domain Registration' )
									: purchaseType( purchase ) }
							</div>
							<div className="manage-purchase__price">
								{ isPartnerPurchase( purchase ) && ! isA4ABillingDragonPurchase( purchase ) ? (
									<div className="manage-purchase__contact-partner">
										{ translate( 'Please contact %(partnerName)s for details', {
											args: {
												partnerName: getPartnerName( purchase ) ?? '',
											},
										} ) }
									</div>
								) : (
									<>
										{ isOneTimePurchase( purchase ) && (
											<PlanPrice
												rawPrice={ purchase.regularPriceInteger }
												isSmallestUnit
												currencyCode={ purchase.currencyCode }
												isOnSale={ !! purchase.saleAmount }
											/>
										) }
									</>
								) }
							</div>
						</div>
						{ isProductOwner && ! purchase.isLocked && (
							<div className="manage-purchase__renew-upgrade-buttons">
								{ this.renderUpgradeButton( preventRenewal ) }
								{ ! preventRenewal && this.renderRenewButton() }
							</div>
						) }
					</header>
					{ this.renderPurchaseDescription() }
					{ ( ! isPartnerPurchase( purchase ) || isA4ABillingDragonPurchase( purchase ) ) && (
						<PurchaseMeta
							purchaseId={ purchase.id }
							siteSlug={ siteSlug }
							hasLoadedPurchasesFromServer={ hasLoadedPurchasesFromServer }
							getManagePurchaseUrlFor={ getManagePurchaseUrlFor ?? managePurchase }
							getChangePaymentMethodUrlFor={
								getChangePaymentMethodUrlFor ?? getChangePaymentMethodPath
							}
							isA4ABillingDragonPurchase={ isA4ABillingDragonPurchase( purchase ) }
						/>
					) }
				</Card>
				{ ! isPartnerPurchase( purchase ) && (
					<PurchasePlanDetails
						purchaseId={ this.props.purchaseId }
						isProductOwner={ isProductOwner ?? undefined }
					/>
				) }
				{ isProductOwner && ! purchase.isLocked && (
					<>
						{ this.renderChangePlanNavItem() }
						{ ! preventRenewal &&
							! renderMonthlyRenewalOption &&
							! isActive100YearPurchase &&
							! this.isPendingDomainRegistration( purchase ) &&
							this.renderRenewNowNavItem() }
						{ ! preventRenewal && renderMonthlyRenewalOption && this.renderRenewAnnuallyNavItem() }
						{ ! preventRenewal && renderMonthlyRenewalOption && this.renderRenewMonthlyNavItem() }
						{ /* TODO: Add ability to Renew Akismet subscription */ }
						{ this.renderUpgradeNavItem() }
						{ this.renderEditPaymentMethodNavItem() }
						{ config.isEnabled( 'jetpack/crm-downloads' ) && this.renderCrmDownloadsNavItem() }
						{ this.renderReinstall() }
						<div className="manage-purchase__downgrade-products">
							{ this.renderCancelPurchaseNavItem() }
							{ this.renderRemovePurchaseNavItem() }
							{ this.renderCancelSurvey() }
						</div>
					</>
				) }
			</Fragment>
		);
	}

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}

		const {
			site,
			siteId,
			siteSlug,
			renewableSitePurchases,
			purchase,
			purchaseAttachedTo,
			isPurchaseTheme,
			translate,
			getManagePurchaseUrlFor,
			getAddNewPaymentMethodUrlFor,
			getChangePaymentMethodUrlFor,
			isProductOwner,
			willAtomicSiteRevert,
		} = this.props;

		// If there is no purchase, query to load the purchases
		if ( ! purchase ) {
			return (
				<Fragment>
					<PurchasesQueryComponent
						isSiteLevel={ this.props.isSiteLevel ?? false }
						selectedSiteId={ this.props.selectedSiteId ?? 0 }
					/>
					{ this.renderPlaceholder() }
				</Fragment>
			);
		}

		let changePaymentMethodPath: string | false = false;
		if ( ! this.isDataLoading( this.props ) && site && canEditPaymentDetails( purchase ) ) {
			changePaymentMethodPath = ( getChangePaymentMethodUrlFor ?? getChangePaymentMethodPath )(
				siteSlug,
				purchase
			);
		}

		let showExpiryNotice = false;

		if (
			purchase &&
			( JETPACK_LEGACY_PLANS as ReadonlyArray< string > ).includes( purchase.productSlug )
		) {
			showExpiryNotice = isCloseToExpiration( purchase );
		}

		let preventRenewal = false;

		if ( ! canExplicitRenew( purchase ) ) {
			preventRenewal = true;
		}

		return (
			<Fragment>
				<TrackPurchasePageView
					eventName="calypso_manage_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>
				{ siteId && <QuerySiteDomains siteId={ siteId } /> }
				{ isPurchaseTheme && (
					<QueryCanonicalTheme siteId={ siteId } themeId={ purchase?.meta ?? '' } />
				) }

				<HeaderCake
					backText={ translate( 'Purchases' ) }
					backHref={ this.props.purchaseListUrl ?? purchasesRoot }
				>
					{ this.props.cardTitle || titles.managePurchase }
				</HeaderCake>
				{ showExpiryNotice ? (
					<Notice status="is-info" text={ <PlanRenewalMessage /> } showDismiss={ false }>
						<NoticeAction href={ `/plans/${ siteSlug || '' }` }>
							{ translate( 'View plans' ) }
						</NoticeAction>
					</Notice>
				) : (
					<PurchaseNotice
						isDataLoading={ this.isDataLoading( this.props ) }
						handleRenew={ this.handleRenew }
						handleRenewMultiplePurchases={ this.handleRenewMultiplePurchases }
						selectedSite={ site }
						purchase={ purchase }
						purchaseAttachedTo={ purchaseAttachedTo }
						renewableSitePurchases={ renewableSitePurchases }
						changePaymentMethodPath={ changePaymentMethodPath }
						getManagePurchaseUrlFor={ getManagePurchaseUrlFor ?? managePurchase }
						isProductOwner={ isProductOwner ?? false }
						willAtomicSiteRevert={ willAtomicSiteRevert }
						getAddNewPaymentMethodUrlFor={
							getAddNewPaymentMethodUrlFor ?? getAddNewPaymentMethodPath
						}
					/>
				) }
				<PlanOverlapNotice
					isSiteLevel={ this.props.isSiteLevel ?? false }
					selectedSiteId={ this.props.selectedSiteId ?? 0 }
					siteId={ this.props.siteId ?? 0 }
					purchase={ purchase }
				/>
				{ this.renderPurchaseDetail( preventRenewal ) }
			</Fragment>
		);
	}
}

function addPaymentMethodLinkText( {
	purchase,
	translate,
}: {
	purchase: Purchase;
	translate: LocalizeProps[ 'translate' ];
} ) {
	let linkText = null;
	// TODO: we need a "hasRechargeablePaymentMethod" function here
	if ( hasPaymentMethod( purchase ) && ! isPaidWithCredits( purchase ) ) {
		linkText = translate( 'Change payment method' );
	} else {
		linkText = translate( 'Add payment method' );
	}
	return linkText;
}

function BBEPurchaseDescription( { purchase }: { purchase: Purchase } ) {
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, purchase.siteId ) );
	const { isLoading, data: websiteContentQueryResult } = useGetWebsiteContentQuery( siteSlug );
	const difmTieredPurchaseDetails = getDIFMTieredPurchaseDetails( purchase );
	if ( ! difmTieredPurchaseDetails ) {
		return;
	}

	const extraPageCount = difmTieredPurchaseDetails.extraPageCount || 0;
	const numberOfIncludedPages = difmTieredPurchaseDetails.numberOfIncludedPages as number;

	const BBESupportLink = (
		<a
			href={ `mailto:services+express@wordpress.com?subject=${ encodeURIComponent(
				`I have a question about my project: ${ siteSlug }`
			) }` }
		/>
	);

	return (
		<div
			className={ clsx( 'manage-purchase__description', {
				'is-placeholder': isLoading,
			} ) }
		>
			{ ! isLoading && (
				<>
					<div>
						{ numberOfIncludedPages === 1
							? translate(
									'A professionally built single page website in 4 business days or less.'
							  )
							: translate(
									'A professionally built %(numberOfIncludedPages)s-page website in 4 business days or less.',
									{
										args: {
											numberOfIncludedPages,
										},
									}
							  ) }{ ' ' }
						{ extraPageCount > 0
							? translate(
									'This purchase includes %(numberOfPages)d extra page.',
									'This purchase includes %(numberOfPages)d extra pages.',
									{
										count: extraPageCount ?? 0,
										args: {
											numberOfPages: extraPageCount,
										},
									}
							  )
							: null }
					</div>
					<div>
						{ websiteContentQueryResult?.isWebsiteContentSubmitted
							? translate(
									'{{BBESupportLink}}Contact us{{/BBESupportLink}} with any questions or inquiries about your project.',
									{
										components: {
											BBESupportLink,
										},
									}
							  )
							: translate(
									'{{FormLink}}Submit content{{/FormLink}} for your website build or {{BBESupportLink}}contact us{{/BBESupportLink}} with any questions about your project.',
									{
										components: {
											FormLink: (
												<a
													href={ `/start/site-content-collection/website-content?siteSlug=${ siteSlug }` }
												/>
											),
											BBESupportLink,
										},
									}
							  ) }
					</div>
				</>
			) }
		</div>
	);
}

function PlanOverlapNotice( {
	isSiteLevel,
	selectedSiteId,
	siteId,
	purchase,
}: {
	isSiteLevel: boolean;
	selectedSiteId: number;
	siteId: number;
	purchase: Purchase;
} ) {
	if ( isSiteLevel ) {
		if ( ! selectedSiteId ) {
			// Probably still loading
			return null;
		}
		return (
			<AsyncLoad
				require={ loadProductPlanOverlapNotices }
				placeholder={ null }
				plans={ JETPACK_PLANS }
				products={ JETPACK_PRODUCTS_LIST }
				siteId={ selectedSiteId }
				currentPurchase={ purchase }
			/>
		);
	}
	if ( ! siteId ) {
		// Probably still loading
		return null;
	}
	return (
		<AsyncLoad
			require={ loadProductPlanOverlapNotices }
			placeholder={ null }
			plans={ JETPACK_PLANS }
			products={ JETPACK_PRODUCTS_LIST }
			siteId={ siteId }
			currentPurchase={ purchase }
		/>
	);
}

function PurchasesQueryComponent( {
	isSiteLevel,
	selectedSiteId,
}: {
	isSiteLevel: boolean;
	selectedSiteId: number;
} ) {
	if ( isSiteLevel ) {
		if ( ! selectedSiteId ) {
			// Probably still loading
			return null;
		}
		return <QuerySitePurchases siteId={ selectedSiteId } />;
	}
	return <QueryUserPurchases />;
}

/**
 * Gradually move more of the `connect` logic to this component
 */
const WrappedManagePurchase = (
	props: Omit<
		ManagePurchaseProps & ManagePurchaseConnectedProps & LocalizeProps,
		'relatedMonthlyPlanPrice'
	>
) => {
	const { siteId, relatedMonthlyPlanSlug } = props;
	const pricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ relatedMonthlyPlanSlug as PlanSlug ],
		siteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} );

	return (
		<ManagePurchase
			{ ...props }
			relatedMonthlyPlanPrice={ pricing?.[ relatedMonthlyPlanSlug ]?.originalPrice.monthly ?? 0 }
		/>
	);
};

const ConnectedManagePurchase = connect( ( state: IAppState, props: ManagePurchaseProps ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );

	const purchaseAttachedTo =
		purchase && purchase.attachedToPurchaseId
			? getByPurchaseId( state, purchase.attachedToPurchaseId )
			: null;
	const selectedSiteId = getSelectedSiteId( state );
	const siteId = purchase?.siteId ?? null;
	const purchases = purchase && getSitePurchases( state, purchase.siteId );
	const userId = getCurrentUserId( state );
	const isProductOwner = purchase && purchase.userId === userId;
	const renewableSitePurchases = getRenewableSitePurchases( state, siteId );
	const isPurchasePlan = purchase && isPlan( purchase );
	const isPurchaseTheme = purchase && isThemePurchase( purchase );
	const productsList = getProductsList( state );
	const site = getSite( state, siteId ?? undefined );
	const hasLoadedSites = ! isRequestingSites( state );
	const hasLoadedDomains = hasLoadedSiteDomains( state, siteId );
	const relatedMonthlyPlanSlug = getMonthlyPlanByYearly( purchase?.productSlug ?? '' );
	const primaryDomain = getPrimaryDomainBySiteId( state, siteId );
	const currentRoute = getCurrentRoute( state );
	const domains = purchase && getDomainsBySiteId( state, purchase.siteId );
	const selectedDomainName = purchase && getName( purchase );
	const selectedDomain =
		domains && selectedDomainName && getSelectedDomain( { domains, selectedDomainName } );

	return {
		currentRoute,
		domainsDetails: getAllDomains( state ),
		hasCustomPrimaryDomain: hasCustomDomain( site ),
		hasLoadedDomains,
		hasLoadedPurchasesFromServer: props.isSiteLevel
			? hasLoadedSitePurchasesFromServer( state )
			: hasLoadedUserPurchasesFromServer( state ),
		hasLoadedSites,
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
		hasSetupAds: Boolean(
			site?.options?.wordads || isRequestingWordAdsApprovalForSite( state, site )
		),
		hasCompletedCancelPurchaseSurvey: purchase
			? getPreference( state, getCancelPurchaseSurveyCompletedPreferenceKey( purchase.id ) )
			: false,
		isAtomicSite: isSiteAtomic( state, siteId ),
		isDomainOnlySite: purchase && isDomainOnly( state, purchase.siteId ),
		isProductOwner,
		willAtomicSiteRevert: purchase
			? willAtomicSiteRevertAfterPurchaseDeactivation( state, purchase.id, [] )
			: false,
		isPurchaseTheme,
		plan: isPurchasePlan && applyTestFiltersToPlansList( purchase.productSlug, undefined ),
		primaryDomain: primaryDomain,
		productsList,
		purchase,
		purchaseAttachedTo,
		purchases,
		relatedMonthlyPlanSlug,
		renewableSitePurchases,
		selectedDomain,
		selectedSiteId,
		site,
		siteId,
		theme: isPurchaseTheme && siteId && getCanonicalTheme( state, siteId, purchase.meta ?? null ),
	};
}, mapDispatchToProps )( localize( WrappedManagePurchase ) );

function mapDispatchToProps( dispatch: CalypsoDispatch ) {
	return {
		dispatch,
		...bindActionCreators(
			{
				handleRenewNowClick,
				handleRenewMultiplePurchasesClick,
				errorNotice,
				successNotice,
			},
			dispatch
		),
	};
}

function ManagePurchaseWithExperiment( props: ManagePurchaseProps ) {
	const isSplitCancelRemoveEnabled = useIsSplitCancelRemoveEnabled();
	const { data: cancelFeaturesResponse } = useQuery( {
		...purchaseCancelFeaturesQuery( props.purchaseId, 'treatment' ),
		enabled: isSplitCancelRemoveEnabled,
	} );
	const cancellationFeatures = isSplitCancelRemoveEnabled
		? cancelFeaturesResponse?.features ?? null
		: null;
	return (
		<ConnectedManagePurchase
			{ ...props }
			isSplitCancelRemoveEnabled={ isSplitCancelRemoveEnabled }
			cancellationFeatures={ cancellationFeatures }
		/>
	);
}

export default ManagePurchaseWithExperiment;
