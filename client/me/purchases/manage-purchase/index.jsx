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
import AsyncLoad from 'components/async-load';
import { abtest } from 'lib/abtest';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { applyTestFiltersToPlansList } from 'lib/plans';
import { Button, Card, CompactCard, ProductIcon } from '@automattic/components';
import config from 'config';
import { shouldShowOfferResetFlow } from 'lib/plans/config';
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
} from 'lib/purchases';
import { canEditPaymentDetails, getEditCardDetailsPath, isDataLoading } from '../utils';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
	getRenewableSitePurchases,
} from 'state/purchases/selectors';
import { getCanonicalTheme } from 'state/themes/selectors';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import {
	isPersonal,
	isPremium,
	isBusiness,
	isPlan,
	isDomainProduct,
	isDomainRegistration,
	isDomainMapping,
	isDomainTransfer,
	isGoogleApps,
	isTheme,
	isJetpackProduct,
	isConciergeSession,
} from 'lib/products-values';
import { getSite, isRequestingSites } from 'state/sites/selectors';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { JETPACK_PLANS, JETPACK_LEGACY_PLANS } from 'lib/plans/constants';
import PlanPrice from 'my-sites/plan-price';
import ProductLink from 'me/purchases/product-link';
import PurchaseMeta from './purchase-meta';
import PurchaseNotice from './notices';
import PurchasePlanDetails from './plan-details';
import PurchaseSiteHeader from '../purchases-site/header';
import QueryCanonicalTheme from 'components/data/query-canonical-theme';
import QuerySiteDomains from 'components/data/query-site-domains';
import QueryUserPurchases from 'components/data/query-user-purchases';
import RemovePurchase from '../remove-purchase';
import VerticalNavItem from 'components/vertical-nav/item';
import { cancelPurchase, managePurchase, purchasesRoot } from '../paths';
import { CALYPSO_CONTACT } from 'lib/url/support';
import titles from 'me/purchases/titles';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import TrackPurchasePageView from 'me/purchases/track-purchase-page-view';
import PlanRenewalMessage from 'my-sites/plans-v2/plan-renewal-message';
import { currentUserHasFlag, getCurrentUser, getCurrentUserId } from 'state/current-user/selectors';
import CartStore from 'lib/cart/store';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'state/current-user/constants';
import { hasCustomDomain } from 'lib/site/utils';
import { hasLoadedSiteDomains } from 'state/sites/domains/selectors';
import NonPrimaryDomainDialog from 'me/purchases/non-primary-domain-dialog';

/**
 * Style dependencies
 */
import './style.scss';

class ManagePurchase extends Component {
	static propTypes = {
		showHeader: PropTypes.bool,
		purchaseListUrl: PropTypes.string,
		getCancelPurchaseUrlFor: PropTypes.func,
		getAddPaymentMethodUrlFor: PropTypes.func,
		getManagePurchaseUrlFor: PropTypes.func,
		cardTitle: PropTypes.string,
		hasLoadedDomains: PropTypes.bool,
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		hasNonPrimaryDomainsFlag: PropTypes.bool,
		isAtomicSite: PropTypes.bool,
		purchase: PropTypes.object,
		purchaseAttachedTo: PropTypes.object,
		renewableSitePurchases: PropTypes.arrayOf( PropTypes.object ),
		site: PropTypes.object,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
		userId: PropTypes.number,
	};

	static defaultProps = {
		showHeader: true,
		purchaseListUrl: purchasesRoot,
		getAddPaymentMethodUrlFor: getEditCardDetailsPath,
		cardTitle: titles.managePurchase,
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

	componentDidMount() {
		if ( this.props.siteId ) {
			CartStore.setSelectedSiteId( this.props.siteId );
		}
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.isDataValid() && ! this.isDataValid( nextProps ) ) {
			page.redirect( this.props.purchaseListUrl );
			return;
		}
	}

	componentDidUpdate( { siteId } ) {
		if ( this.props.siteId && siteId !== this.props.siteId ) {
			CartStore.setSelectedSiteId( this.props.siteId );
		}
	}

	isDataValid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		return Boolean( props.purchase );
	}

	handleRenew = () => {
		handleRenewNowClick( this.props.purchase, this.props.siteSlug );
	};

	handleRenewMultiplePurchases = ( purchases ) => {
		handleRenewMultiplePurchasesClick( purchases, this.props.siteSlug );
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

	renderSelectNewNavItem() {
		const { translate, siteId } = this.props;

		return (
			<CompactCard tagName="button" displayAsLink href={ `/plans/${ siteId }/` }>
				{ translate( 'Select a new plan' ) }
			</CompactCard>
		);
	}

	renderEditPaymentMethodNavItem() {
		const { purchase, translate } = this.props;

		if ( ! this.props.site ) {
			return null;
		}

		if ( canEditPaymentDetails( purchase ) ) {
			const path = this.props.getAddPaymentMethodUrlFor( this.props.siteSlug, purchase );
			const renewing = isRenewing( purchase );

			if (
				renewing &&
				isPaidWithCreditCard( purchase ) &&
				! cardProcessorSupportsUpdates( purchase )
			) {
				return null;
			}

			return (
				<CompactCard href={ path }>
					{ hasPaymentMethod( purchase )
						? translate( 'Change Payment Method' )
						: translate( 'Add Credit Card' ) }
				</CompactCard>
			);
		}

		return null;
	}

	renderRemovePurchaseNavItem() {
		return (
			<RemovePurchase
				hasLoadedSites={ this.props.hasLoadedSites }
				hasLoadedUserPurchasesFromServer={ this.props.hasLoadedUserPurchasesFromServer }
				hasNonPrimaryDomainsFlag={ this.props.hasNonPrimaryDomainsFlag }
				hasCustomPrimaryDomain={ this.props.hasCustomPrimaryDomain }
				site={ this.props.site }
				purchase={ this.props.purchase }
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

		let text,
			link = this.props.getCancelPurchaseUrlFor( this.props.siteSlug, id );

		if ( isAtomicSite && isSubscription( purchase ) && ! isGoogleApps( purchase ) ) {
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

	renderPlanIcon() {
		const { purchase } = this.props;
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

		if ( isTheme( purchase ) ) {
			return (
				<div className="manage-purchase__plan-icon">
					<Gridicon icon="themes" size={ 54 } />
				</div>
			);
		}

		return null;
	}

	renderPlanDescription() {
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
		const { siteSlug, getManagePurchaseUrlFor, getAddPaymentMethodUrlFor } = this.props;

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
						getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
						getAddPaymentMethodUrlFor={ getAddPaymentMethodUrlFor }
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

	renderPurchaseDetail( preventRenewal ) {
		if ( isDataLoading( this.props ) || this.isDomainsLoading( this.props ) ) {
			return this.renderPlaceholder();
		}

		const {
			purchase,
			siteId,
			translate,
			isProductOwner,
			getManagePurchaseUrlFor,
			siteSlug,
			getAddPaymentMethodUrlFor,
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

		return (
			<Fragment>
				{ this.props.showHeader && (
					<PurchaseSiteHeader siteId={ siteId } name={ siteName } domain={ siteDomain } />
				) }
				<Card className={ classes }>
					<header className="manage-purchase__header">
						{ this.renderPlanIcon() }
						<h2 className="manage-purchase__title">{ getDisplayName( purchase ) }</h2>
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
					{ this.renderPlanDescription() }
					{ ! isPartnerPurchase( purchase ) && (
						<PurchaseMeta
							purchaseId={ purchase.id }
							siteSlug={ siteSlug }
							getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
							getAddPaymentMethodUrlFor={ getAddPaymentMethodUrlFor }
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
			getAddPaymentMethodUrlFor,
			isProductOwner,
		} = this.props;

		let editCardDetailsPath = false;
		if ( ! isDataLoading( this.props ) && site && canEditPaymentDetails( purchase ) ) {
			editCardDetailsPath = getAddPaymentMethodUrlFor( siteSlug, purchase );
		}

		let showExpiryNotice = false;
		let preventRenewal = false;

		if (
			shouldShowOfferResetFlow() &&
			purchase &&
			JETPACK_LEGACY_PLANS.includes( purchase.productSlug )
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
				<PageViewTracker
					path="/me/purchases/:site/:purchaseId"
					title="Purchases > Manage Purchase"
				/>
				<QueryUserPurchases userId={ this.props.userId } />
				{ siteId && <QuerySiteDomains siteId={ siteId } /> }
				{ isPurchaseTheme && <QueryCanonicalTheme siteId={ siteId } themeId={ purchase.meta } /> }
				<HeaderCake backHref={ this.props.purchaseListUrl }>{ this.props.cardTitle }</HeaderCake>
				{ showExpiryNotice ? (
					<Notice status="is-info" text={ <PlanRenewalMessage /> } showDismiss={ false }>
						<NoticeAction href={ `/plans/${ site.slug || '' }` }>
							{ translate( 'View plans' ) }
						</NoticeAction>
					</Notice>
				) : (
					<PurchaseNotice
						isDataLoading={ isDataLoading( this.props ) }
						handleRenew={ this.handleRenew }
						handleRenewMultiplePurchases={ this.handleRenewMultiplePurchases }
						selectedSite={ site }
						purchase={ purchase }
						purchaseAttachedTo={ purchaseAttachedTo }
						renewableSitePurchases={ renewableSitePurchases }
						editCardDetailsPath={ editCardDetailsPath }
						getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
						isProductOwner={ isProductOwner }
						getAddPaymentMethodUrlFor={ getAddPaymentMethodUrlFor }
					/>
				) }
				<AsyncLoad
					require="blocks/product-plan-overlap-notices"
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

export default connect( ( state, props ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );
	const purchaseAttachedTo =
		purchase && purchase.attachedToPurchaseId
			? getByPurchaseId( state, purchase.attachedToPurchaseId )
			: null;
	const siteId = purchase ? purchase.siteId : null;
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
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
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
	};
} )( localize( ManagePurchase ) );
