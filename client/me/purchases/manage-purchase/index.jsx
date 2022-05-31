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
	isTheme,
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
} from '@automattic/calypso-products';
import { Button, Card, CompactCard, ProductIcon, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import AsyncLoad from 'calypso/components/async-load';
import Badge from 'calypso/components/badge';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import HeaderCake from 'calypso/components/header-cake';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	getDomainRegistrationAgreementUrl,
	getDisplayName,
	getPartnerName,
	getRenewalPrice,
	handleRenewMultiplePurchasesClick,
	handleRenewNowClick,
	hasAmountAvailableToRefund,
	hasPaymentMethod,
	isPaidWithCredits,
	isCancelable,
	isExpired,
	isOneTimePurchase,
	isPartnerPurchase,
	isRenewable,
	isSubscription,
	isCloseToExpiration,
	purchaseType,
	getName,
	shouldRenderMonthlyRenewalOption,
} from 'calypso/lib/purchases';
import { hasCustomDomain } from 'calypso/lib/site/utils';
import { addQueryArgs } from 'calypso/lib/url';
import NonPrimaryDomainDialog from 'calypso/me/purchases/non-primary-domain-dialog';
import ProductLink from 'calypso/me/purchases/product-link';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import PlanPrice from 'calypso/my-sites/plan-price';
import PlanRenewalMessage from 'calypso/my-sites/plans/jetpack-plans/plan-renewal-message';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import {
	currentUserHasFlag,
	getCurrentUser,
	getCurrentUserId,
} from 'calypso/state/current-user/selectors';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	getSitePurchases,
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
	hasLoadedSitePurchasesFromServer,
	getRenewableSitePurchases,
} from 'calypso/state/purchases/selectors';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSitePlanRawPrice } from 'calypso/state/sites/plans/selectors';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { cancelPurchase, managePurchase, purchasesRoot } from '../paths';
import PurchaseSiteHeader from '../purchases-site/header';
import RemovePurchase from '../remove-purchase';
import {
	canEditPaymentDetails,
	getAddNewPaymentMethodPath,
	getChangePaymentMethodPath,
	isJetpackTemporarySitePurchase,
} from '../utils';
import PurchaseNotice from './notices';
import PurchasePlanDetails from './plan-details';
import PurchaseMeta from './purchase-meta';

import './style.scss';

class ManagePurchase extends Component {
	static propTypes = {
		cardTitle: PropTypes.string,
		getAddNewPaymentMethodUrlFor: PropTypes.func,
		getCancelPurchaseUrlFor: PropTypes.func,
		getChangePaymentMethodUrlFor: PropTypes.func,
		getManagePurchaseUrlFor: PropTypes.func,
		hasLoadedDomains: PropTypes.bool,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedPurchasesFromServer: PropTypes.bool.isRequired,
		hasNonPrimaryDomainsFlag: PropTypes.bool,
		isAtomicSite: PropTypes.bool,
		isJetpackTemporarySite: PropTypes.bool,
		renewableSitePurchases: PropTypes.arrayOf( PropTypes.object ),
		productsList: PropTypes.object,
		purchase: PropTypes.object,
		purchases: PropTypes.array,
		purchaseAttachedTo: PropTypes.object,
		purchaseListUrl: PropTypes.string,
		redirectTo: PropTypes.string,
		showHeader: PropTypes.bool,
		site: PropTypes.object,
		siteId: PropTypes.number,
		selectedSiteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
		isSiteLevel: PropTypes.bool,
	};

	static defaultProps = {
		showHeader: true,
		purchaseListUrl: purchasesRoot,
		getAddNewPaymentMethodUrlFor: getAddNewPaymentMethodPath,
		getChangePaymentMethodUrlFor: getChangePaymentMethodPath,
		getCancelPurchaseUrlFor: cancelPurchase,
		getManagePurchaseUrlFor: managePurchase,
	};

	state = {
		showNonPrimaryDomainWarningDialog: false,
		cancelLink: null,
	};

	componentDidMount() {
		if ( ! this.isDataValid() ) {
			page.redirect( this.props.purchaseListUrl );
			return;
		}
	}

	componentDidUpdate( prevProps ) {
		if ( this.isDataValid( prevProps ) && ! this.isDataValid() ) {
			page.redirect( this.props.purchaseListUrl );
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

		handleRenewNowClick( purchase, siteSlug, options );
	};

	handleRenewMonthly = () => {
		const { relatedMonthlyPlanSlug, siteSlug, redirectTo } = this.props;
		// Track the Renew Monthly submit.
		recordTracksEvent( 'calypso_purchases_renew_monthly_click', {
			product_slug: relatedMonthlyPlanSlug,
		} );

		// Redirect to the checkout page with the monthly plan in cart
		const checkoutUrlArgs = {};
		if ( redirectTo ) {
			checkoutUrlArgs.redirect_to = redirectTo;
		}
		const checkoutUrlWithArgs = addQueryArgs(
			checkoutUrlArgs,
			`/checkout/${ relatedMonthlyPlanSlug }/${ siteSlug || '' }`
		);
		page( checkoutUrlWithArgs );
	};

	handleRenewMultiplePurchases = ( purchases ) => {
		const { siteSlug, redirectTo } = this.props;
		const options = redirectTo ? { redirectTo } : undefined;
		handleRenewMultiplePurchasesClick( purchases, siteSlug, options );
	};

	shouldShowNonPrimaryDomainWarning() {
		const { hasNonPrimaryDomainsFlag, hasCustomPrimaryDomain, purchase } = this.props;
		return hasNonPrimaryDomainsFlag && isPlan( purchase ) && hasCustomPrimaryDomain;
	}

	renderRenewButton() {
		const { purchase, translate } = this.props;

		if ( isPartnerPurchase( purchase ) || ! isRenewable( purchase ) || ! this.props.site ) {
			return null;
		}

		return (
			<Button className="manage-purchase__renew-button" onClick={ this.handleRenew } compact>
				{ translate( 'Renew now' ) }
			</Button>
		);
	}

	renderUpgradeButton() {
		const { purchase, translate } = this.props;

		const isUpgradeablePlan =
			isPlan( purchase ) &&
			! isEcommerce( purchase ) &&
			! isPro( purchase ) &&
			! isComplete( purchase ) &&
			! isP2Plus( purchase );
		const isUpgradeableProduct =
			! isPlan( purchase ) && JETPACK_BACKUP_T1_PRODUCTS.includes( purchase.productSlug );

		if ( ! isUpgradeablePlan && ! isUpgradeableProduct ) {
			return null;
		}

		if ( isExpired( purchase ) ) {
			return null;
		}

		const upgradeUrl = this.getUpgradeUrl();

		return (
			<Button primary compact href={ upgradeUrl }>
				{ translate( 'Upgrade' ) }
			</Button>
		);
	}

	renderSelectNewButton() {
		const { translate, siteId } = this.props;

		return (
			<Button className="manage-purchase__renew-button" href={ `/plans/${ siteId }` } compact>
				{ translate( 'Select a new plan' ) }
			</Button>
		);
	}

	renderRenewalNavItem( content, onClick ) {
		const { purchase } = this.props;

		if ( ! isRenewable( purchase ) || ! this.props.site ) {
			return null;
		}

		if ( isPartnerPurchase( purchase ) ) {
			return null;
		}

		return (
			<CompactCard tagName="button" displayAsLink onClick={ onClick }>
				{ content }
			</CompactCard>
		);
	}

	renderRenewNowNavItem() {
		const { translate } = this.props;
		return this.renderRenewalNavItem( translate( 'Renew Now' ), this.handleRenew );
	}

	renderRenewAnnuallyNavItem() {
		const { translate, purchase, relatedMonthlyPlanPrice } = this.props;
		const annualPrice = getRenewalPrice( purchase ) / 12;
		const savings = Math.round(
			( 100 * ( relatedMonthlyPlanPrice - annualPrice ) ) / relatedMonthlyPlanPrice
		);
		return this.renderRenewalNavItem(
			<div>
				{ translate( 'Renew Annually' ) }
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
		return this.renderRenewalNavItem( translate( 'Renew Monthly' ), this.handleRenewMonthly );
	}

	handleUpgradeClick = () => {
		const { purchase } = this.props;

		recordTracksEvent( 'calypso_purchases_upgrade_plan', {
			status: isExpired( purchase ) ? 'expired' : 'active',
			plan: purchase.productName,
		} );
	};

	getUpgradeUrl() {
		const { purchase, siteId } = this.props;

		const isUpgradeableBackupProduct = JETPACK_BACKUP_T1_PRODUCTS.includes( purchase.productSlug );
		const isUpgradeableSecurityPlan = JETPACK_SECURITY_T1_PLANS.includes( purchase.productSlug );

		if ( isUpgradeableBackupProduct || isUpgradeableSecurityPlan ) {
			return `/plans/storage/${ siteId }`;
		}

		return `/plans/${ siteId }`;
	}

	renderUpgradeNavItem() {
		const { purchase, translate } = this.props;

		const isUpgradeablePlan =
			purchase &&
			isPlan( purchase ) &&
			! isEcommerce( purchase ) &&
			! isPro( purchase ) &&
			! isComplete( purchase ) &&
			! isP2Plus( purchase );

		const isUpgradeableBackupProduct = JETPACK_BACKUP_T1_PRODUCTS.includes( purchase.productSlug );
		const isUpgradeableProduct = isUpgradeableBackupProduct;

		if ( ! isUpgradeablePlan && ! isUpgradeableProduct ) {
			return null;
		}

		let buttonText;
		if ( isExpired( purchase ) ) {
			buttonText = isUpgradeablePlan
				? translate( 'Pick Another Plan' )
				: translate( 'Pick Another Product' );
		} else {
			buttonText = translate( 'Upgrade' );
		}

		const upgradeUrl = this.getUpgradeUrl();

		return (
			<CompactCard
				tagName="button"
				displayAsLink
				href={ upgradeUrl }
				onClick={ this.handleUpgradeClick }
			>
				{ buttonText }
			</CompactCard>
		);
	}

	renderSelectNewNavItem() {
		const { translate, siteId } = this.props;

		return (
			<CompactCard tagName="button" displayAsLink href={ `/plans/${ siteId }` }>
				{ translate( 'Select a new plan' ) }
			</CompactCard>
		);
	}

	handleEditPaymentMethodNavItem = () => {
		recordTracksEvent( 'calypso_purchases_edit_payment_method' );
	};

	renderEditPaymentMethodNavItem() {
		const { purchase, translate, siteSlug, getChangePaymentMethodUrlFor } = this.props;

		if ( ! this.props.site ) {
			return null;
		}

		if ( canEditPaymentDetails( purchase ) ) {
			const path = getChangePaymentMethodUrlFor( siteSlug, purchase );

			return (
				<CompactCard href={ path } onClick={ this.handleEditPaymentMethodNavItem }>
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
			site,
			purchase,
			purchaseListUrl,
		} = this.props;

		return (
			<RemovePurchase
				hasLoadedSites={ hasLoadedSites }
				hasLoadedUserPurchasesFromServer={ this.props.hasLoadedPurchasesFromServer }
				hasNonPrimaryDomainsFlag={ hasNonPrimaryDomainsFlag }
				hasCustomPrimaryDomain={ hasCustomPrimaryDomain }
				activeSubscriptions={ this.getActiveMarketplaceSubscriptions() }
				site={ site }
				purchase={ purchase }
				purchaseListUrl={ purchaseListUrl }
			/>
		);
	}

	showNonPrimaryDomainWarningDialog( cancelLink ) {
		this.setState( {
			showNonPrimaryDomainWarningDialog: true,
			cancelLink,
		} );
	}

	closeDialog = () => {
		this.setState( {
			showNonPrimaryDomainWarningDialog: false,
			cancelLink: null,
		} );
	};

	goToCancelLink = () => {
		const cancelLink = this.state.cancelLink;
		this.closeDialog();
		page( cancelLink );
	};

	renderNonPrimaryDomainWarningDialog( site, purchase ) {
		if ( this.state.showNonPrimaryDomainWarningDialog ) {
			return (
				<NonPrimaryDomainDialog
					isDialogVisible={ this.state.showNonPrimaryDomainWarningDialog }
					closeDialog={ this.closeDialog }
					removePlan={ this.goToCancelLink }
					planName={ getName( purchase ) }
					oldDomainName={ site.domain }
					newDomainName={ site.wpcom_url }
				/>
			);
		}

		return null;
	}

	renderCancelPurchaseNavItem() {
		const { isAtomicSite, purchase, translate } = this.props;
		const { id } = purchase;

		if ( ! isCancelable( purchase ) ) {
			return null;
		}

		let text;
		const link = this.props.getCancelPurchaseUrlFor( this.props.siteSlug, id );

		if ( hasAmountAvailableToRefund( purchase ) ) {
			if ( isDomainRegistration( purchase ) ) {
				text = translate( 'Cancel Domain and Refund' );
			}

			if ( isSubscription( purchase ) ) {
				text = translate( 'Cancel Subscription and Refund' );
			}

			if ( isOneTimePurchase( purchase ) ) {
				text = translate( 'Cancel and Refund' );
			}
		} else {
			if ( isDomainTransfer( purchase ) ) {
				return null;
			}

			if ( isDomainRegistration( purchase ) ) {
				text = translate( 'Cancel Domain' );
			}

			if ( isSubscription( purchase ) ) {
				text = translate( 'Cancel Subscription' );
			}
		}

		const onClick = ( event ) => {
			recordTracksEvent( 'calypso_purchases_manage_purchase_cancel_click', {
				product_slug: purchase.productSlug,
				is_atomic: isAtomicSite,
				link_text: text,
			} );

			if ( this.shouldShowNonPrimaryDomainWarning() ) {
				event.preventDefault();
				this.showNonPrimaryDomainWarningDialog( link );
			}
		};

		return (
			<CompactCard href={ link } className="remove-purchase__card" onClick={ onClick }>
				{ text }
			</CompactCard>
		);
	}

	renderPurchaseIcon() {
		const { purchase, translate } = this.props;

		if ( isPlan( purchase ) || isJetpackProduct( purchase ) ) {
			return (
				<div className="manage-purchase__plan-icon">
					<ProductIcon slug={ purchase.productSlug } />
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

		if ( isTheme( purchase ) ) {
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

		if ( isPlan( purchase ) ) {
			return plan.getDescription();
		}

		if ( isTheme( purchase ) && theme ) {
			return theme.description;
		}

		if ( isConciergeSession( purchase ) ) {
			return purchase.description;
		}

		if ( isDomainMapping( purchase ) || isDomainRegistration( purchase ) ) {
			return translate(
				"Replaces your site's free address, %(domain)s, with the domain, " +
					'making it easier to remember and easier to share.',
				{
					args: {
						domain: purchase.domain,
					},
				}
			);
		}

		if ( isDomainTransfer( purchase ) ) {
			return translate(
				'Transfers an existing domain from another provider to WordPress.com, ' +
					'helping you manage your site and domain in one place.'
			);
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
									domain: purchase.meta,
								},
							}
						) }
					</>
				);
			}

			return description;
		}

		return purchaseType( purchase );
	}

	renderPurchaseDescription() {
		const { purchase, site, translate } = this.props;

		const registrationAgreementUrl = getDomainRegistrationAgreementUrl( purchase );
		const domainRegistrationAgreementLinkText = translate( 'Domain Registration Agreement' );

		return (
			<div className="manage-purchase__content">
				<span className="manage-purchase__description">{ this.getPurchaseDescription() }</span>

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
						getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
						getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
					/>
				</Card>
				<PurchasePlanDetails isPlaceholder />
				<VerticalNavItem isPlaceholder />
				<VerticalNavItem isPlaceholder />
			</Fragment>
		);
	}

	isDomainsLoading( props ) {
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

		if ( ! isPlan( purchase ) ) return [];

		return purchases.filter(
			( _purchase ) =>
				_purchase.active && hasMarketplaceProduct( productsList, _purchase.productSlug )
		);
	}

	renderPurchaseDetail( preventRenewal ) {
		if ( this.isDataLoading( this.props ) || this.isDomainsLoading( this.props ) ) {
			return this.renderPlaceholder();
		}

		const {
			purchase,
			translate,
			isJetpackTemporarySite,
			isProductOwner,
			getManagePurchaseUrlFor,
			siteSlug,
			getChangePaymentMethodUrlFor,
			hasLoadedPurchasesFromServer,
		} = this.props;

		const classes = classNames( 'manage-purchase__info', {
			'is-expired': purchase && isExpired( purchase ),
			'is-personal': purchase && isPersonal( purchase ),
			'is-premium': purchase && isPremium( purchase ),
			'is-business': purchase && isBusiness( purchase ),
			'is-jetpack-product': purchase && isJetpackProduct( purchase ),
		} );
		const siteName = purchase.siteName;
		const siteDomain = purchase.domain;
		const siteId = purchase.siteId;

		const renderMonthlyRenewalOption = shouldRenderMonthlyRenewalOption( purchase );

		return (
			<Fragment>
				{ this.props.showHeader && (
					<PurchaseSiteHeader siteId={ siteId } name={ siteName } domain={ siteDomain } />
				) }
				<Card className={ classes }>
					<header className="manage-purchase__header">
						{ this.renderPurchaseIcon() }
						<h2 className="manage-purchase__title">{ this.getProductDisplayName() }</h2>
						<div className="manage-purchase__description">{ purchaseType( purchase ) }</div>
						<div className="manage-purchase__price">
							{ isPartnerPurchase( purchase ) ? (
								<div className="manage-purchase__contact-partner">
									{ translate( 'Please contact your site host %(partnerName)s for details', {
										args: {
											partnerName: getPartnerName( purchase ),
										},
									} ) }
								</div>
							) : (
								<PlanPrice
									rawPrice={ getRenewalPrice( purchase ) }
									productDisplayPrice={ purchase.productDisplayPrice }
									currencyCode={ purchase.currencyCode }
									taxText={ purchase.taxText }
									isOnSale={ !! purchase.saleAmount }
								/>
							) }
						</div>
					</header>
					{ this.renderPurchaseDescription() }
					{ ! isPartnerPurchase( purchase ) && (
						<PurchaseMeta
							purchaseId={ purchase.id }
							siteSlug={ siteSlug }
							hasLoadedPurchasesFromServer={ hasLoadedPurchasesFromServer }
							getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
							getChangePaymentMethodUrlFor={ getChangePaymentMethodUrlFor }
						/>
					) }
					{ isProductOwner && ! purchase.isLocked && (
						<div className="manage-purchase__renew-upgrade-buttons">
							{ preventRenewal && this.renderSelectNewButton() }
							{ this.renderUpgradeButton() }
							{ ! preventRenewal && this.renderRenewButton() }
						</div>
					) }
				</Card>
				<PurchasePlanDetails
					purchaseId={ this.props.purchaseId }
					isProductOwner={ isProductOwner }
				/>

				{ isProductOwner && ! purchase.isLocked && (
					<>
						{ preventRenewal && this.renderSelectNewNavItem() }
						{ ! preventRenewal && ! renderMonthlyRenewalOption && this.renderRenewNowNavItem() }
						{ ! preventRenewal && renderMonthlyRenewalOption && this.renderRenewAnnuallyNavItem() }
						{ ! preventRenewal && renderMonthlyRenewalOption && this.renderRenewMonthlyNavItem() }
						{ ! isJetpackTemporarySite && this.renderUpgradeNavItem() }
						{ this.renderEditPaymentMethodNavItem() }
						{ this.renderCancelPurchaseNavItem() }
						{ ! isJetpackTemporarySite && this.renderRemovePurchaseNavItem() }
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
		let changePaymentMethodPath = false;
		if ( ! this.isDataLoading( this.props ) && site && canEditPaymentDetails( purchase ) ) {
			changePaymentMethodPath = getChangePaymentMethodUrlFor( siteSlug, purchase );
		}

		let showExpiryNotice = false;
		let preventRenewal = false;

		if ( purchase && JETPACK_LEGACY_PLANS.includes( purchase.productSlug ) ) {
			showExpiryNotice = isCloseToExpiration( purchase );
			preventRenewal = ! isRenewable( purchase );
		}

		return (
			<Fragment>
				<QueryStoredCards />
				<TrackPurchasePageView
					eventName="calypso_manage_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>
				<PurchasesQueryComponent
					isSiteLevel={ this.props.isSiteLevel }
					selectedSiteId={ this.props.selectedSiteId }
				/>
				{ siteId && <QuerySiteDomains siteId={ siteId } /> }
				{ isPurchaseTheme && <QueryCanonicalTheme siteId={ siteId } themeId={ purchase.meta } /> }

				<HeaderCake backHref={ this.props.purchaseListUrl }>
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
						getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
						isProductOwner={ isProductOwner }
						getAddNewPaymentMethodUrlFor={ getAddNewPaymentMethodUrlFor }
					/>
				) }
				<PlanOverlapNotice
					isSiteLevel={ this.props.isSiteLevel }
					selectedSiteId={ this.props.selectedSiteId }
					siteId={ this.props.siteId }
					purchase={ this.props.purchase }
				/>
				{ this.renderPurchaseDetail( preventRenewal ) }
				{ site && this.renderNonPrimaryDomainWarningDialog( site, purchase ) }
			</Fragment>
		);
	}
}

function addPaymentMethodLinkText( { purchase, translate } ) {
	let linkText = null;
	// TODO: we need a "hasRechargeablePaymentMethod" function here
	if ( hasPaymentMethod( purchase ) && ! isPaidWithCredits( purchase ) ) {
		linkText = translate( 'Change Payment Method' );
	} else {
		linkText = translate( 'Add Payment Method' );
	}
	return linkText;
}

function PlanOverlapNotice( { isSiteLevel, selectedSiteId, siteId, purchase } ) {
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

function PurchasesQueryComponent( { isSiteLevel, selectedSiteId } ) {
	if ( isSiteLevel ) {
		if ( ! selectedSiteId ) {
			// Probably still loading
			return null;
		}
		return <QuerySitePurchases siteId={ selectedSiteId } />;
	}
	return <QueryUserPurchases />;
}

export default connect( ( state, props ) => {
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
	const isPurchaseTheme = purchase && isTheme( purchase );
	const productsList = getProductsList( state );
	const site = getSite( state, siteId );
	const hasLoadedSites = ! isRequestingSites( state );
	const hasLoadedDomains = hasLoadedSiteDomains( state, siteId );
	const relatedMonthlyPlanSlug = getMonthlyPlanByYearly( purchase?.productSlug );
	const relatedMonthlyPlanPrice = getSitePlanRawPrice( state, siteId, relatedMonthlyPlanSlug );
	return {
		hasLoadedDomains,
		hasLoadedSites,
		hasLoadedPurchasesFromServer: props.isSiteLevel
			? hasLoadedSitePurchasesFromServer( state )
			: hasLoadedUserPurchasesFromServer( state ),
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
		hasCustomPrimaryDomain: hasCustomDomain( site ),
		productsList,
		purchase,
		purchases,
		purchaseAttachedTo,
		siteId,
		selectedSiteId,
		isProductOwner,
		site,
		renewableSitePurchases,
		plan: isPurchasePlan && applyTestFiltersToPlansList( purchase.productSlug, undefined ),
		isPurchaseTheme,
		theme: isPurchaseTheme && getCanonicalTheme( state, siteId, purchase.meta ),
		isAtomicSite: isSiteAtomic( state, siteId ),
		relatedMonthlyPlanSlug,
		relatedMonthlyPlanPrice,
		isJetpackTemporarySite: purchase && isJetpackTemporarySitePurchase( purchase.domain ),
	};
} )( localize( ManagePurchase ) );
