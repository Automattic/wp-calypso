/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';

/**
 * Internal Dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import { abtest } from 'calypso/lib/abtest';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { Button, Card, CompactCard, ProductIcon } from '@automattic/components';
import config from '@automattic/calypso-config';
import {
	cardProcessorSupportsUpdates,
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
	isPaidWithCreditCard,
	isPartnerPurchase,
	isRenewable,
	isRenewing,
	isSubscription,
	isCloseToExpiration,
	purchaseType,
	getName,
} from 'calypso/lib/purchases';
import {
	canEditPaymentDetails,
	getAddNewPaymentMethodPath,
	getChangePaymentMethodPath,
} from '../utils';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
	hasLoadedSitePurchasesFromServer,
	getRenewableSitePurchases,
} from 'calypso/state/purchases/selectors';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import Gridicon from 'calypso/components/gridicon';
import HeaderCake from 'calypso/components/header-cake';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
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
	isJetpackSearch,
	isTheme,
	isJetpackProduct,
	isConciergeSession,
	isTitanMail,
	applyTestFiltersToPlansList,
	isWpComMonthlyPlan,
	JETPACK_PLANS,
	JETPACK_LEGACY_PLANS,
	JETPACK_PRODUCTS_LIST,
	isP2Plus,
} from '@automattic/calypso-products';
import { getSite, isRequestingSites } from 'calypso/state/sites/selectors';
import PlanPrice from 'calypso/my-sites/plan-price';
import ProductLink from 'calypso/me/purchases/product-link';
import PurchaseMeta from './purchase-meta';
import PurchaseNotice from './notices';
import PurchasePlanDetails from './plan-details';
import PurchaseSiteHeader from '../purchases-site/header';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import RemovePurchase from '../remove-purchase';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { cancelPurchase, managePurchase, purchasesRoot } from '../paths';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import titles from 'calypso/me/purchases/titles';
import TrackPurchasePageView from 'calypso/me/purchases/track-purchase-page-view';
import PlanRenewalMessage from 'calypso/my-sites/plans/jetpack-plans/plan-renewal-message';
import {
	currentUserHasFlag,
	getCurrentUser,
	getCurrentUserId,
} from 'calypso/state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { hasCustomDomain } from 'calypso/lib/site/utils';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import NonPrimaryDomainDialog from 'calypso/me/purchases/non-primary-domain-dialog';

/**
 * Style dependencies
 */
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
		renewableSitePurchases: PropTypes.arrayOf( PropTypes.object ),
		purchase: PropTypes.object,
		purchaseAttachedTo: PropTypes.object,
		purchaseListUrl: PropTypes.string,
		redirectTo: PropTypes.string,
		showHeader: PropTypes.bool,
		site: PropTypes.object,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
		userId: PropTypes.number,
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

	UNSAFE_componentWillMount() {
		if ( ! this.isDataValid() ) {
			page.redirect( this.props.purchaseListUrl );
			return;
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.isDataValid() && ! this.isDataValid( nextProps ) ) {
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

		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		if ( isPartnerPurchase( purchase ) || ! isRenewable( purchase ) || ! this.props.site ) {
			return null;
		}

		return (
			<Button className="manage-purchase__renew-button" onClick={ this.handleRenew } compact>
				{ translate( 'Renew now' ) }
			</Button>
		);
	}

	renderSelectNewButton() {
		const { translate, siteId } = this.props;

		return (
			<Button className="manage-purchase__renew-button" href={ `/plans/${ siteId }/` } compact>
				{ translate( 'Select a new plan' ) }
			</Button>
		);
	}

	renderRenewNowNavItem() {
		const { purchase, translate } = this.props;

		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		if ( ! isRenewable( purchase ) || ! this.props.site ) {
			return null;
		}

		if ( isPartnerPurchase( purchase ) ) {
			return null;
		}

		return (
			<CompactCard tagName="button" displayAsLink onClick={ this.handleRenew }>
				{ translate( 'Renew Now' ) }
			</CompactCard>
		);
	}

	handleUpgradeClick = () => {
		const { purchase } = this.props;

		recordTracksEvent( 'calypso_purchases_upgrade_plan', {
			status: isExpired( purchase ) ? 'expired' : 'active',
			plan: purchase.productName,
		} );
	};

	renderUpgradeNavItem() {
		const { purchase, translate, siteId } = this.props;
		const buttonText = isExpired( purchase )
			? translate( 'Pick Another Plan' )
			: translate( 'Upgrade Plan' );

		if (
			! isPlan( purchase ) ||
			isEcommerce( purchase ) ||
			isComplete( purchase ) ||
			isP2Plus( purchase )
		) {
			return null;
		}

		return (
			<CompactCard
				tagName="button"
				displayAsLink
				href={ `/plans/${ siteId }/` }
				onClick={ this.handleUpgradeClick }
			>
				{ buttonText }
			</CompactCard>
		);
	}

	renderSelectNewNavItem() {
		const { translate, siteId } = this.props;

		return (
			<CompactCard tagName="button" displayAsLink href={ `/plans/${ siteId }/` }>
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
			const renewing = isRenewing( purchase );

			if (
				renewing &&
				isPaidWithCreditCard( purchase ) &&
				! cardProcessorSupportsUpdates( purchase )
			) {
				return null;
			}

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
		let link = this.props.getCancelPurchaseUrlFor( this.props.siteSlug, id );

		if (
			isAtomicSite &&
			isSubscription( purchase ) &&
			! isGSuiteOrGoogleWorkspace( purchase ) &&
			! isTitanMail( purchase ) &&
			! isJetpackSearch( purchase )
		) {
			text = translate( 'Contact Support to Cancel your Subscription' );
			link = CALYPSO_CONTACT;
		} else if ( hasAmountAvailableToRefund( purchase ) ) {
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
			<CompactCard href={ link } onClick={ onClick }>
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

	renderPurchaseDescription() {
		const { plan, purchase, site, theme, translate } = this.props;

		let description = purchaseType( purchase );

		if ( isPlan( purchase ) ) {
			description = plan.getDescription();
		} else if ( isTheme( purchase ) && theme ) {
			description = theme.description;
		} else if ( isConciergeSession( purchase ) ) {
			description = purchase.description;
		} else if ( isDomainMapping( purchase ) || isDomainRegistration( purchase ) ) {
			description = translate(
				"Replaces your site's free address, %(domain)s, with the domain, " +
					'making it easier to remember and easier to share.',
				{
					args: {
						domain: purchase.domain,
					},
				}
			);
		} else if ( isDomainTransfer( purchase ) ) {
			description = translate(
				'Transfers an existing domain from another provider to WordPress.com, ' +
					'helping you manage your site and domain in one place.'
			);
		} else if ( isGSuiteOrGoogleWorkspace( purchase ) ) {
			description = translate(
				'Professional email integrated with Google Meet and other collaboration tools from Google.'
			);

			if ( purchase.purchaseRenewalQuantity ) {
				description = (
					<>
						{ description }{ ' ' }
						{ translate(
							'This purchase is for %(numberOfUsers)d user for the domain %(domain)s.',
							'This purchase is for %(numberOfUsers)d users for the domain %(domain)s.',
							{
								count: purchase.purchaseRenewalQuantity,
								args: {
									numberOfUsers: purchase.purchaseRenewalQuantity,
									domain: purchase.meta,
								},
							}
						) }
					</>
				);
			}
		} else if ( isTitanMail( purchase ) ) {
			description = translate(
				'Easy-to-use email with incredibly powerful features. Manage your email and more on any device.'
			);

			if ( purchase.purchaseRenewalQuantity ) {
				description = (
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
		}

		const registrationAgreementUrl = getDomainRegistrationAgreementUrl( purchase );
		const domainRegistrationAgreementLinkText = translate( 'Domain Registration Agreement' );

		return (
			<div className="manage-purchase__content">
				<span className="manage-purchase__description">{ description }</span>
				<span className="manage-purchase__settings-link">
					{ site && <ProductLink purchase={ purchase } selectedSite={ site } /> }
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

	renderPurchaseDetail( preventRenewal ) {
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

		const classes = classNames( 'manage-purchase__info', {
			'is-expired': purchase && isExpired( purchase ),
			'is-personal': isPersonal( purchase ),
			'is-premium': isPremium( purchase ),
			'is-business': isBusiness( purchase ),
			'is-jetpack-product': isJetpackProduct( purchase ),
		} );
		const siteName = purchase.siteName;
		const siteDomain = purchase.domain;
		const siteId = purchase.siteId;

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
					{ isProductOwner && preventRenewal && this.renderSelectNewButton() }
					{ isProductOwner && ! preventRenewal && this.renderRenewButton() }
				</Card>
				<PurchasePlanDetails
					purchaseId={ this.props.purchaseId }
					isProductOwner={ isProductOwner }
				/>

				{ isProductOwner && preventRenewal && this.renderSelectNewNavItem() }
				{ isProductOwner && ! preventRenewal && this.renderRenewNowNavItem() }
				{ isProductOwner && ! preventRenewal && this.renderUpgradeNavItem() }
				{ isProductOwner && this.renderEditPaymentMethodNavItem() }
				{ isProductOwner && this.renderCancelPurchaseNavItem() }
				{ isProductOwner && this.renderRemovePurchaseNavItem() }
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
				<TrackPurchasePageView
					eventName="calypso_manage_purchase_view"
					purchaseId={ this.props.purchaseId }
				/>
				{ this.props.siteId ? (
					<QuerySitePurchases siteId={ this.props.siteId } />
				) : (
					<QueryUserPurchases userId={ this.props.userId } />
				) }
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
				<AsyncLoad
					require="calypso/blocks/product-plan-overlap-notices"
					placeholder={ null }
					plans={ JETPACK_PLANS }
					products={ JETPACK_PRODUCTS_LIST }
					siteId={ siteId }
					currentPurchase={ purchase }
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
		linkText = config.isEnabled( 'purchases/new-payment-methods' )
			? translate( 'Add Payment Method' )
			: translate( 'Add Credit Card' );
	}
	return linkText;
}

export default connect( ( state, props ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );
	const purchaseAttachedTo =
		purchase && purchase.attachedToPurchaseId
			? getByPurchaseId( state, purchase.attachedToPurchaseId )
			: null;
	const selectedSiteId = getSelectedSiteId( state );
	const siteId = selectedSiteId || ( purchase ? purchase.siteId : null );
	const userId = getCurrentUserId( state );
	const isProductOwner = purchase && purchase.userId === userId;
	const renewableSitePurchases = getRenewableSitePurchases( state, siteId );
	const isPurchasePlan = purchase && isPlan( purchase );
	const isPurchaseTheme = purchase && isTheme( purchase );
	const site = getSite( state, siteId );
	const hasLoadedSites = ! isRequestingSites( state );
	const hasLoadedDomains = hasLoadedSiteDomains( state, siteId );
	return {
		hasLoadedDomains,
		hasLoadedSites,
		hasLoadedPurchasesFromServer: selectedSiteId
			? hasLoadedSitePurchasesFromServer( state )
			: hasLoadedUserPurchasesFromServer( state ),
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
		hasCustomPrimaryDomain: hasCustomDomain( site ),
		purchase,
		purchaseAttachedTo,
		siteId,
		isProductOwner,
		site,
		renewableSitePurchases,
		plan: isPurchasePlan && applyTestFiltersToPlansList( purchase.productSlug, abtest ),
		isPurchaseTheme,
		theme: isPurchaseTheme && getCanonicalTheme( state, siteId, purchase.meta ),
		isAtomicSite: isSiteAtomic( state, siteId ),
		userId,
	};
} )( localize( ManagePurchase ) );
