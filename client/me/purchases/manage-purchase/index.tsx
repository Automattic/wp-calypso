/* eslint-disable wpcalypso/jsx-classname-namespace */
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
import clsx from 'clsx';
import { localize, LocalizeProps, useTranslate } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { SupportedSlugs } from 'calypso/../packages/components/src/product-icon/config';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import AsyncLoad from 'calypso/components/async-load';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import CancelPurchaseForm from 'calypso/components/marketing-survey/cancel-purchase-form';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import reinstallPlugins from 'calypso/data/marketplace/reinstall-plugins-api';
import HundredYearPlanLogo from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/hundred-year-plan-step-wrapper/hundred-year-plan-logo';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { resolveDomainStatus } from 'calypso/lib/domains';
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
	isExpired,
	isOneTimePurchase,
	isPartnerPurchase,
	isRenewable,
	isSubscription,
	isCloseToExpiration,
	purchaseType,
	getName,
	shouldRenderMonthlyRenewalOption,
	getDIFMTieredPurchaseDetails,
} from 'calypso/lib/purchases';
import { getPurchaseCancellationFlowType } from 'calypso/lib/purchases/utils';
import { hasCustomDomain } from 'calypso/lib/site/utils';
import { addQueryArgs } from 'calypso/lib/url';
import NonPrimaryDomainDialog from 'calypso/me/purchases/non-primary-domain-dialog';
import ProductLink from 'calypso/me/purchases/product-link';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import WordAdsEligibilityWarningDialog from 'calypso/me/purchases/wordads-eligibility-warning-dialog';
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
} from 'calypso/state/purchases/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import isDomainOnly from 'calypso/state/selectors/is-domain-only-site';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import { useGetWebsiteContentQuery } from 'calypso/state/signup/steps/website-content/hooks/use-get-website-content-query';
import { hasLoadedSiteDomains, getAllDomains } from 'calypso/state/sites/domains/selectors';
import { getSite, getSiteSlug, isRequestingSites } from 'calypso/state/sites/selectors';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import { CalypsoDispatch, IAppState } from 'calypso/state/types';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isRequestingWordAdsApprovalForSite } from 'calypso/state/wordads/approve/selectors';
import { cancelPurchase, managePurchase, purchasesRoot } from '../paths';
import PurchaseSiteHeader from '../purchases-site/header';
import RemovePurchase from '../remove-purchase';
import {
	canEditPaymentDetails,
	getAddNewPaymentMethodPath,
	getChangePaymentMethodPath,
	isJetpackTemporarySitePurchase,
	isAkismetTemporarySitePurchase,
	isMarketplaceTemporarySitePurchase,
	getCancelPurchaseSurveyCompletedPreferenceKey,
} from '../utils';
import PurchaseNotice from './notices';
import PurchasePlanDetails from './plan-details';
import PurchaseMeta from './purchase-meta';
import type { FilteredPlan, PlanSlug } from '@automattic/calypso-products';
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
	showNonPrimaryDomainWarningDialog: boolean;
	showWordAdsEligibilityWarningDialog: boolean;
	cancelLink: string | null;
	isRemoving: boolean;
	isCancelSurveyVisible: boolean;
	isReinstalling: boolean;
}

class ManagePurchase extends Component<
	ManagePurchaseProps & ManagePurchaseConnectedProps & LocalizeProps,
	ManagePurchaseState
> {
	state = {
		showNonPrimaryDomainWarningDialog: false,
		showWordAdsEligibilityWarningDialog: false,
		cancelLink: null,
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
		const options = redirectTo ? { redirectTo } : undefined;
		const isSitelessRenewal =
			isAkismetTemporarySitePurchase( purchase ) || isMarketplaceTemporarySitePurchase( purchase );

		if ( ! purchase ) {
			return;
		}

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

	shouldShowNonPrimaryDomainWarning() {
		const { hasNonPrimaryDomainsFlag, hasCustomPrimaryDomain, purchase } = this.props;
		return hasNonPrimaryDomainsFlag && purchase && isPlan( purchase ) && hasCustomPrimaryDomain;
	}

	shouldShowWordAdsEligibilityWarning() {
		const { hasSetupAds, purchase } = this.props;
		return hasSetupAds && purchase && isPlan( purchase );
	}

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
			isPartnerPurchase( purchase ) ||
			! isRenewable( purchase ) ||
			( ! this.props.site &&
				! isAkismetTemporarySitePurchase( purchase ) &&
				! isMarketplaceTemporarySitePurchase( purchase ) ) ||
			isAkismetFreeProduct( purchase ) ||
			( is100Year( purchase ) && ! isCloseToExpiration( purchase ) )
		) {
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

		if ( isExpired( purchase ) ) {
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

	renderSelectNewButton() {
		const { translate, siteId, purchase } = this.props;

		if ( purchase && this.isPendingDomainRegistration( purchase ) ) {
			return null;
		}

		return (
			<Button className="manage-purchase__renew-button" href={ `/plans/${ siteId }` } compact>
				{ translate( 'Select a new plan' ) }
			</Button>
		);
	}

	renderRenewalNavItem( content: JSX.Element | string, onClick: () => void ) {
		const { purchase } = this.props;
		if ( ! purchase ) {
			return null;
		}

		if (
			isPartnerPurchase( purchase ) ||
			! isRenewable( purchase ) ||
			( ! this.props.site &&
				! isAkismetTemporarySitePurchase( purchase ) &&
				! isMarketplaceTemporarySitePurchase( purchase ) ) ||
			isAkismetFreeProduct( purchase )
		) {
			return null;
		}

		return (
			<CompactCard tagName="button" displayAsLink onClick={ onClick }>
				<MaterialIcon icon="autorenew" className="card__icon" />
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
			status: isExpired( purchase ) ? 'expired' : 'active',
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

	renderUpgradeNavItem() {
		const { purchase, translate } = this.props;
		if ( ! purchase ) {
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

		let iconName;
		let buttonText;

		if ( isExpired( purchase ) ) {
			iconName = 'view_carousel';
			buttonText = isUpgradeablePlan
				? translate( 'Pick another plan' )
				: translate( 'Pick another product' );
		} else {
			iconName = 'upload';
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
				<MaterialIcon icon={ iconName } className="card__icon" />
				{ buttonText }
			</CompactCard>
		);
	}

	renderSelectNewNavItem() {
		const { translate, siteId, purchase } = this.props;

		if ( purchase && this.isPendingDomainRegistration( purchase ) ) {
			return null;
		}

		return (
			<CompactCard tagName="button" displayAsLink href={ `/plans/${ siteId }` }>
				{ translate( 'Select a new plan' ) }
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

		if ( isPartnerPurchase( purchase ) ) {
			return null;
		}

		if (
			! this.props.site &&
			! isAkismetTemporarySitePurchase( purchase ) &&
			! isMarketplaceTemporarySitePurchase( purchase )
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
					<MaterialIcon icon="credit_card" className="card__icon" />
					{ addPaymentMethodLinkText( { purchase, translate } ) }
				</CompactCard>
			);
		}

		return null;
	}

	renderRemovePurchaseNavItem() {
		const {
			hasLoadedSites,
			hasNonPrimaryDomainsFlag,
			hasCustomPrimaryDomain,
			hasCompletedCancelPurchaseSurvey,
			site,
			purchase,
			purchaseListUrl,
			translate,
		} = this.props;
		if ( ! purchase ) {
			return null;
		}

		if ( canAutoRenewBeTurnedOff( purchase ) ) {
			return null;
		}

		const isPlanPurchase = isPlan( purchase );
		let text = translate( 'Remove subscription' );

		if ( isPlanPurchase ) {
			text = translate( 'Remove plan' );
		} else if ( isDomainRegistration( purchase ) ) {
			text = translate( 'Remove domain' );
		}

		return (
			<RemovePurchase
				hasLoadedSites={ hasLoadedSites }
				hasLoadedUserPurchasesFromServer={ this.props.hasLoadedPurchasesFromServer }
				hasNonPrimaryDomainsFlag={ hasNonPrimaryDomainsFlag }
				hasSetupAds={ this.props.hasSetupAds }
				hasCustomPrimaryDomain={ hasCustomPrimaryDomain }
				activeSubscriptions={ this.getActiveMarketplaceSubscriptions() }
				site={ site }
				purchase={ purchase }
				purchaseListUrl={ purchaseListUrl ?? purchasesRoot }
				linkIcon="chevron-right"
				skipRemovePlanSurvey={ isPlanPurchase && hasCompletedCancelPurchaseSurvey }
			>
				<MaterialIcon icon="delete" className="card__icon" />
				{ text }
			</RemovePurchase>
		);
	}

	showNonPrimaryDomainWarningDialog( cancelLink: string ) {
		this.setState( {
			showNonPrimaryDomainWarningDialog: true,
			showWordAdsEligibilityWarningDialog: false,
			isRemoving: false,
			isCancelSurveyVisible: false,
			cancelLink,
		} );
	}

	showWordAdsEligibilityWarningDialog( cancelLink: string ) {
		this.setState( {
			showNonPrimaryDomainWarningDialog: false,
			showWordAdsEligibilityWarningDialog: true,
			isRemoving: false,
			isCancelSurveyVisible: false,
			cancelLink,
		} );
	}

	showPreCancellationModalDialog = () => {
		this.setState( {
			showNonPrimaryDomainWarningDialog: false,
			showWordAdsEligibilityWarningDialog: false,
			isRemoving: false,
			isCancelSurveyVisible: true,
			cancelLink: null,
		} );
	};

	closeDialog = () => {
		this.setState( {
			showNonPrimaryDomainWarningDialog: false,
			showWordAdsEligibilityWarningDialog: false,
			isRemoving: false,
			isCancelSurveyVisible: false,
			cancelLink: null,
		} );
	};

	goToCancelLink = () => {
		const cancelLink = this.state.cancelLink;
		if ( ! cancelLink ) {
			return;
		}
		this.closeDialog();
		page( cancelLink );
	};

	renderNonPrimaryDomainWarningDialog( site: SiteDetails, purchase: Purchase ) {
		if ( this.state.showNonPrimaryDomainWarningDialog ) {
			return (
				<NonPrimaryDomainDialog
					isDialogVisible={ this.state.showNonPrimaryDomainWarningDialog }
					closeDialog={ this.closeDialog }
					removePlan={ this.goToCancelLink }
					planName={ getName( purchase ) }
					oldDomainName={ site.domain }
					newDomainName={ site.wpcom_url }
					hasSetupAds={ this.props.hasSetupAds }
				/>
			);
		}

		return null;
	}

	renderWordAdsEligibilityWarningDialog( purchase: Purchase ) {
		if ( this.state.showWordAdsEligibilityWarningDialog ) {
			return (
				<WordAdsEligibilityWarningDialog
					isDialogVisible={ this.state.showWordAdsEligibilityWarningDialog }
					closeDialog={ this.closeDialog }
					removePlan={ this.goToCancelLink }
					planName={ getName( purchase ) }
				/>
			);
		}

		return null;
	}

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
				onClickFinalConfirm={ this.cancelSubscription }
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
		if ( ! ( purchase?.active && hasMarketplaceProduct( productsList, purchase.productSlug ) ) ) {
			return null;
		}

		if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
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
						<MaterialIcon icon="build" className="card__icon" />
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
		const { isAtomicSite, purchase, translate } = this.props;
		if ( ! purchase ) {
			return null;
		}
		const { id } = purchase;

		if ( ! canAutoRenewBeTurnedOff( purchase ) ) {
			return null;
		}

		const link = ( this.props.getCancelPurchaseUrlFor ?? cancelPurchase )(
			this.props.siteSlug,
			id
		);
		const canRefund = hasAmountAvailableToRefund( purchase );

		if ( ! canRefund && isDomainTransfer( purchase ) ) {
			return null;
		}

		// If it's a 100-year domain, don't show the cancel button
		if ( this.isHundredYearDomain( purchase ) ) {
			return null;
		}

		const onClick = ( event: { preventDefault: () => void } ) => {
			recordTracksEvent( 'calypso_purchases_manage_purchase_cancel_click', {
				product_slug: purchase.productSlug,
				is_atomic: isAtomicSite,
				link_text: getCancelPurchaseNavText( purchase, translate ),
			} );

			if ( this.shouldShowWordAdsEligibilityWarning() ) {
				event.preventDefault();
				this.showWordAdsEligibilityWarningDialog( link );
			}

			if ( this.shouldShowNonPrimaryDomainWarning() ) {
				event.preventDefault();
				this.showNonPrimaryDomainWarningDialog( link );
			}
		};

		return (
			<CompactCard href={ link } className="remove-purchase__card" onClick={ onClick }>
				<MaterialIcon icon="delete" className="card__icon" />
				{ getCancelPurchaseNavText( purchase, translate ) }
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
					<HundredYearPlanLogo width={ 50 } />
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
		const { purchase, site, translate } = this.props;

		if ( ! purchase ) {
			return null;
		}

		if ( isMarketplaceTemporarySitePurchase( purchase ) ) {
			return null;
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
				<PurchasePlanDetails isPlaceholder />
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

		return purchases.filter(
			( _purchase ) =>
				_purchase.active && hasMarketplaceProduct( productsList, _purchase.productSlug )
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
			'is-expired': purchase && isExpired( purchase ),
			'is-personal': purchase && isPersonal( purchase ),
			'is-premium': purchase && isPremium( purchase ),
			'is-business': purchase && isBusiness( purchase ),
			'is-jetpack-product': purchase && isJetpackProduct( purchase ),
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
						<h2 className="manage-purchase__title">{ this.getProductDisplayName() }</h2>
						<div className="manage-purchase__description">
							{ isHundredYearDomain
								? translate( '100-Year Domain Registration' )
								: purchaseType( purchase ) }
						</div>
						<div className="manage-purchase__price">
							{ isPartnerPurchase( purchase ) ? (
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
											taxText={ purchase.taxText }
											isOnSale={ !! purchase.saleAmount }
										/>
									) }
								</>
							) }
						</div>
					</header>
					{ this.renderPurchaseDescription() }
					{ ! isPartnerPurchase( purchase ) && (
						<PurchaseMeta
							purchaseId={ purchase.id }
							siteSlug={ siteSlug }
							hasLoadedPurchasesFromServer={ hasLoadedPurchasesFromServer }
							getManagePurchaseUrlFor={ getManagePurchaseUrlFor ?? managePurchase }
							getChangePaymentMethodUrlFor={
								getChangePaymentMethodUrlFor ?? getChangePaymentMethodPath
							}
						/>
					) }
					{ isProductOwner && ! purchase.isLocked && (
						<div className="manage-purchase__renew-upgrade-buttons">
							{ preventRenewal && this.renderSelectNewButton() }
							{ this.renderUpgradeButton( preventRenewal ) }
							{ ! preventRenewal && this.renderRenewButton() }
						</div>
					) }
				</Card>
				{ ! isPartnerPurchase( purchase ) && (
					<PurchasePlanDetails
						purchaseId={ this.props.purchaseId }
						isProductOwner={ isProductOwner }
					/>
				) }
				{ isProductOwner && ! purchase.isLocked && (
					<>
						{ preventRenewal && this.renderSelectNewNavItem() }
						{ ! preventRenewal &&
							! renderMonthlyRenewalOption &&
							! isActive100YearPurchase &&
							! this.isPendingDomainRegistration( purchase ) &&
							this.renderRenewNowNavItem() }
						{ ! preventRenewal && renderMonthlyRenewalOption && this.renderRenewAnnuallyNavItem() }
						{ ! preventRenewal && renderMonthlyRenewalOption && this.renderRenewMonthlyNavItem() }
						{ /* We don't want to show the Renew/Upgrade nav item for "Jetpack" temporary sites, but we DO
						show it for "Akismet" temporary sites. (And all other types of purchases) */ }
						{ /* TODO: Add ability to Renew Akismet subscription */ }
						{ ! isJetpackTemporarySitePurchase( purchase ) && this.renderUpgradeNavItem() }
						{ this.renderEditPaymentMethodNavItem() }
						{ this.renderReinstall() }
						{ this.renderCancelPurchaseNavItem() }
						{ this.renderCancelSurvey() }
						{ this.renderRemovePurchaseNavItem() }
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
		let preventRenewal = false;

		if (
			purchase &&
			( JETPACK_LEGACY_PLANS as ReadonlyArray< string > ).includes( purchase.productSlug )
		) {
			showExpiryNotice = isCloseToExpiration( purchase );
			preventRenewal = ! isRenewable( purchase );
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

				<HeaderCake backHref={ this.props.purchaseListUrl ?? purchasesRoot }>
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
						isProductOwner={ isProductOwner }
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
				{ this.renderWordAdsEligibilityWarningDialog( purchase ) }
				{ site && this.renderNonPrimaryDomainWarningDialog( site, purchase ) }
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
				require="calypso/blocks/product-plan-overlap-notices"
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
			require="calypso/blocks/product-plan-overlap-notices"
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
		storageAddOns: null,
		useCheckPlanAvailabilityForPurchase,
	} );

	return (
		<ManagePurchase
			{ ...props }
			relatedMonthlyPlanPrice={ pricing?.[ relatedMonthlyPlanSlug ]?.originalPrice.monthly ?? 0 }
		/>
	);
};

export default connect( ( state: IAppState, props: ManagePurchaseProps ) => {
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
		hasCompletedCancelPurchaseSurvey: getPreference(
			state,
			getCancelPurchaseSurveyCompletedPreferenceKey( purchase?.id )
		),
		isAtomicSite: isSiteAtomic( state, siteId ),
		isDomainOnlySite: purchase && isDomainOnly( state, purchase.siteId ),
		isProductOwner,
		isPurchaseTheme,
		plan: isPurchasePlan && applyTestFiltersToPlansList( purchase.productSlug, undefined ),
		primaryDomain: primaryDomain,
		productsList,
		purchase,
		purchaseAttachedTo,
		purchases,
		relatedMonthlyPlanSlug,
		renewableSitePurchases,
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

function getCancelPurchaseNavText(
	purchase: Purchase,
	translate: LocalizeProps[ 'translate' ]
): string {
	let text = '';

	if ( isDomainRegistration( purchase ) ) {
		text = translate( 'Cancel domain' );
	} else if ( isPlan( purchase ) ) {
		text = translate( 'Cancel plan' );
	} else if ( isSubscription( purchase ) ) {
		text = translate( 'Cancel subscription' );
	} else if ( isOneTimePurchase( purchase ) ) {
		text = translate( 'Cancel' );
	}
	return text;
}
